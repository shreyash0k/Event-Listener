document.addEventListener("DOMContentLoaded", () => {
    const actionInput = document.getElementById("action-input");
    const frequencyDropdown = document.getElementById("check-frequency-dropdown");
    const notificationTypeDropdown = document.getElementById("notification-type-dropdown");
    const saveFlowBtn = document.getElementById("save-flow-btn");
    const feedback = document.getElementById("feedback");
    const spinner = document.getElementById("spinner");

    const showFeedback = (message, isSuccess) => {
        feedback.textContent = message;
        feedback.className = isSuccess ? "success" : "error";
        feedback.style.display = "block";
    };

    const toggleSpinner = (isLoading) => {
        spinner.style.display = isLoading ? "block" : "none";
        saveFlowBtn.disabled = isLoading;
    };

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0]?.url || null;

        saveFlowBtn.addEventListener("click", () => {
            const action = actionInput.value.trim();
            const listeningInterval = frequencyDropdown.value;
            const notificationType = notificationTypeDropdown.value;

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
                url: currentUrl, // Include the tab URL
                interval: listeningInterval,
                notificationType: notificationType,
            };

            toggleSpinner(true); // Start the spinner

            fetch("http://localhost:5001/trigger", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        showFeedback("Backend Error: " + data.error, false);
                    } else {
                        showFeedback("Listener saved successfully!", true);
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    showFeedback("Failed to save listener.", false);
                })
                .finally(() => {
                    // Stop the spinner after backend response
                    toggleSpinner(false);
                });
        });
    });
});
