import asyncio
import os
import json
import base64
from io import BytesIO
from PIL import Image
from IPython.display import display
from typing import Any, cast
from datetime import datetime
from dotenv import load_dotenv
from anthropic import Anthropic
from anthropic.types.beta import (
    BetaContentBlockParam,
    BetaTextBlockParam,
    BetaImageBlockParam,
    BetaToolResultBlockParam,
    BetaToolUseBlockParam,
    BetaMessageParam,
)

from scrapybara.anthropic import BashTool, ComputerTool, EditTool, ToolResult
from scrapybara import Scrapybara


# Load environment variables
load_dotenv()

# Access API keys from .env
SCRAPYBARA_API_KEY = os.getenv("SCRAPYBARA_API_KEY")
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")


# Initialize Scrapybara
scrapybara_client = Scrapybara(api_key=SCRAPYBARA_API_KEY)
instance = scrapybara_client.start(instance_type="medium")

# Initialize Anthropic
anthropic_client = Anthropic(api_key=CLAUDE_API_KEY)

# System prompt from original Computer Use implementation
SYSTEM_PROMPT = """<SYSTEM_CAPABILITY>
* You are utilising an Ubuntu virtual machine using linux architecture with internet access.
* You can feel free to install Ubuntu applications with your bash tool. Use curl instead of wget.
* To open firefox, please just click on the firefox icon.  Note, firefox-esr is what is installed on your system.
* Using bash tool you can start GUI applications, but you need to set export DISPLAY=:1 and use a subshell. For example "(DISPLAY=:1 xterm &)". GUI apps run with bash tool will appear within your desktop environment, but they may take some time to appear. Take a screenshot to confirm it did.
* When using your bash tool with commands that are expected to output very large quantities of text, redirect into a tmp file and use str_replace_editor or `grep -n -B <lines before> -A <lines after> <query> <filename>` to confirm output.
* When viewing a page it can be helpful to zoom out so that you can see everything on the page.  Either that, or make sure you scroll down to see everything before deciding something isn't available.
* When using your computer function calls, they take a while to run and send back to you.  Where possible/feasible, try to chain multiple of these calls all into one function calls request.
* The current date is {datetime.today().strftime('%A, %B %-d, %Y')}.
</SYSTEM_CAPABILITY>

<IMPORTANT>
* When using Firefox, if a startup wizard appears, IGNORE IT.  Do not even click "skip this step".  Instead, click on the address bar where it says "Search or enter address", and enter the appropriate search term or URL there.
* If the item you are looking at is a pdf, if after taking a single screenshot of the pdf it seems that you want to read the entire document instead of trying to continue to read the pdf from your screenshots + navigation, determine the URL, use curl to download the pdf, install and use pdftotext to convert it to a text file, and then read that text file directly with your StrReplaceEditTool.
</IMPORTANT>"""
class ToolCollection:
    """A collection of anthropic-defined tools."""
    def __init__(self, *tools):
        self.tools = tools
        self.tool_map = {tool.to_params()["name"]: tool for tool in tools}

    def to_params(self) -> list:
        return [tool.to_params() for tool in self.tools]

    async def run(self, *, name: str, tool_input: dict[str, Any]) -> ToolResult:
        tool = self.tool_map.get(name)
        if not tool:
            return None
        try:
            r = await tool(**tool_input)
            return r
        except Exception as e:
            print(f"Error running tool {name}: {e}")
            return None

def _make_api_tool_result(result: ToolResult, tool_use_id: str) -> BetaToolResultBlockParam:
    tool_result_content: list[BetaTextBlockParam | BetaImageBlockParam] | str = []  # Changed this line
    is_error = False
    if result.error:
        is_error = True
        tool_result_content = result.error
    else:
        if result.output:
            tool_result_content.append({
                "type": "text",
                "text": result.output,
            })
        if result.base64_image:
            tool_result_content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": result.base64_image,
                },
            })
    return {
        "type": "tool_result",
        "content": tool_result_content,
        "tool_use_id": tool_use_id,
        "is_error": is_error,
    }

def _response_to_params(response):
    res = []
    for block in response.content:
        if block.type == "text":
            res.append({"type": "text", "text": block.text})
        else:
            res.append(block.model_dump())
    return res

def _maybe_filter_to_n_most_recent_images(
    messages: list[BetaMessageParam],
    images_to_keep: int,
    min_removal_threshold: int,
):
    if images_to_keep is None:
        return messages

    tool_result_blocks = cast(
        list[BetaToolResultBlockParam],
        [
            item
            for message in messages
            for item in (
                message["content"] if isinstance(message["content"], list) else []
            )
            if isinstance(item, dict) and item.get("type") == "tool_result"
        ],
    )

    total_images = sum(
        1
        for tool_result in tool_result_blocks
        for content in tool_result.get("content", [])
        if isinstance(content, dict) and content.get("type") == "image"
    )

    images_to_remove = total_images - images_to_keep
    images_to_remove -= images_to_remove % min_removal_threshold

    for tool_result in tool_result_blocks:
        if isinstance(tool_result.get("content"), list):
            new_content = []
            for content in tool_result.get("content", []):
                if isinstance(content, dict) and content.get("type") == "image":
                    if images_to_remove > 0:
                        images_to_remove -= 1
                        continue
                new_content.append(content)
            tool_result["content"] = new_content
def display_base64_image(base64_string, max_size=(800, 800)):
    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data))

    # Resize if larger than max_size while maintaining aspect ratio
    if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
        image.thumbnail(max_size, Image.Resampling.LANCZOS)

    display(image)

async def sampling_loop(command: str) -> str:
    """
    Run the sampling loop for a single command until completion.
    Returns the final assistant response for logging or saving in the database.
    """
    messages: list[BetaMessageParam] = []
    tool_collection = ToolCollection(
        ComputerTool(instance)
    )

    # Add initial command to messages
    messages.append({
        "role": "user",
        "content": [{"type": "text", "text": command}],
    })

    final_response = ""  # Variable to store the assistant's last response

    while True:
        _maybe_filter_to_n_most_recent_images(messages, 2, 2)

        # Get Claude's response
        response = anthropic_client.beta.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            messages=messages,
            system=[{"type": "text", "text": SYSTEM_PROMPT}],
            tools=tool_collection.to_params(),
            betas=["computer-use-2024-10-22"]
        )

        # Convert response to params
        response_params = _response_to_params(response)

        # Process response content and handle tools before adding to messages
        tool_result_content: list[BetaToolResultBlockParam] = []

        for content_block in response_params:
            if content_block["type"] == "text":
                print(f"\nAssistant: {content_block['text']}")
                final_response = content_block["text"]  # Save the assistant's response

            elif content_block["type"] == "tool_use":

                # Execute the tool
                result = await tool_collection.run(
                    name=content_block["name"],
                    tool_input=cast(dict[str, Any], content_block["input"])
                )

                print(f"Result: {result}")
                if content_block['name'] == 'bash' and not result:
                    result = await tool_collection.run(
                        name="computer",
                        tool_input={"action": "screenshot"}
                    )
                    print("Updated result: ", result)

                if result:
                    print("Converting tool result: ", result)
                    tool_result = _make_api_tool_result(result, content_block["id"])

                    if result.output:
                        print(f"\nTool Output: {result.output}")
                    if result.error:
                        print(f"\nTool Error: {result.error}")
                    if result.base64_image:
                        print("\nTool generated an image (base64 data available)")
                        display_base64_image(result.base64_image)

                    tool_result_content.append(tool_result)

                    print("\n---")

        # Add assistant's response to messages
        messages.append({
            "role": "assistant",
            "content": response_params,
        })

        # If tools were used, add their results to messages
        if tool_result_content:
            messages.append({
                "role": "user",
                "content": tool_result_content
            })
        else:
            # No tools used, task is complete
            break

    # Stop the instance after completing the loop
    instance.stop()
    print("Scrapybara instance stopped.")
    
    # Return the final response from the assistant
    return final_response


# Main function
async def main():
    command = "Open supabase.com and tell me what you see on that."
    await sampling_loop(command)

# Ensure this only runs when main.py is executed directly
if __name__ == "__main__":
    asyncio.run(main())