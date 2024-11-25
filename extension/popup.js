document.addEventListener("DOMContentLoaded", initialize);

/**
 * Initializes the popup by fetching the current tab URL and setting up event listeners.
 */
function initialize() {
    // DOM Elements
    const actionInput = document.getElementById("action-input");
    const frequencyDropdown = document.getElementById("check-frequency-dropdown");
    const notificationTypeDropdown = document.getElementById("notification-type-dropdown");
    const saveFlowBtn = document.getElementById("save-flow-btn");
    const feedback = document.getElementById("feedback");
    const spinner = document.getElementById("spinner");
    const setupContainer = document.getElementById("setup-container");

    let currentUrl = null;

    /**
     * Displays a feedback message to the user.
     * @param {string} message - The message to display.
     * @param {boolean} isSuccess - Indicates success (true) or error (false).
     */
    const showFeedback = (message, isSuccess) => {
        feedback.textContent = message;
        feedback.className = isSuccess ? "success" : "error";
        feedback.style.display = "block";
    };

    /**
     * Toggles the loading spinner visibility.
     * @param {boolean} isLoading - If true, shows the spinner; hides it otherwise.
     */
    const toggleSpinner = (isLoading) => {
        spinner.style.display = isLoading ? "block" : "none";
        saveFlowBtn.disabled = isLoading;
    };

    /**
     * Displays a success message and updates the UI after a successful operation.
     */
    const displaySuccessMessage = () => {
        // Clear the setup container
        setupContainer.innerHTML = "";

        // Success Text
        const successText = document.createElement("p");
        successText.textContent = "Awesome! Leave the rest to us";
        successText.classList.add("success-text");

        // Manage Listeners Button
        const manageListenersButton = document.createElement("button");
        manageListenersButton.textContent = "Manage Listeners";
        manageListenersButton.className = "manage-listeners-btn";

        // Open the management page when clicked
        manageListenersButton.addEventListener("click", () => {
            chrome.tabs.create({
                url: "manage_listeners.html", // Update with the correct path
            });
        });

        // Append to Container
        setupContainer.appendChild(successText);
        setupContainer.appendChild(manageListenersButton);
    };

    /**
     * Handles the click event for the "Save Listener" button.
     * Validates input, sends data to the backend, and handles the response.
     */
    const handleSaveListener = async () => {
        const action = actionInput.value.trim();
        const listeningInterval = frequencyDropdown.value;
        const notificationType = notificationTypeDropdown.value;

        // Validate input fields
        if (!action) {
            showFeedback("Please describe the event to listen for.", false);
            return;
        }

        if (!currentUrl) {
            showFeedback("Failed to retrieve the current tab URL.", false);
            return;
        }

        const payload = {
            event: action,
            url: currentUrl,
            interval: listeningInterval,
            notificationType: notificationType,
        };

        toggleSpinner(true); // Start the spinner

        try {
            const response = await fetch("http://localhost:5001/trigger", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                displaySuccessMessage();
            } else {
                // Display backend error message
                throw new Error(data.error || "An error occurred while saving the listener.");
            }
        } catch (error) {
            console.error("Error:", error);
            showFeedback(`Failed to save listener: ${error.message}`, false);
        } finally {
            toggleSpinner(false); // Stop the spinner
        }
    };

    /**
     * Sets up event listeners for user interactions.
     */
    const initializeEventListeners = () => {
        saveFlowBtn.addEventListener("click", handleSaveListener);
    };

    // Get Current Tab URL and initialize event listeners
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        currentUrl = tabs[0]?.url || null;
        initializeEventListeners();
    });
}
