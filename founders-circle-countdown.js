// Founders Circle Countdown Timer - WordPress Safe
// Paste this code into Code Snippets plugin (without the <script> tags)

(function() {
    // Wait for DOM to be ready
    function initFoundersCountdown() {
        const countdownElement = document.getElementById('countdown-timer');
        if (!countdownElement) {
            console.log('Founders countdown element not found');
            return;
        }

        console.log('Initializing Founders Circle countdown...');

        // Set end date (15 days from now at 11:59:59 PM)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 15);
        endDate.setHours(23, 59, 59, 999);

        function updateCountdown() {
            const now = new Date();
            const timeRemaining = endDate - now;

            if (timeRemaining <= 0) {
                countdownElement.textContent = 'Offer Ended';
                return;
            }

            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            // Format with leading zeros
            const formattedHours = hours.toString().padStart(2, '0');
            const formattedMinutes = minutes.toString().padStart(2, '0');
            const formattedSeconds = seconds.toString().padStart(2, '0');

            countdownElement.textContent = `${days}d ${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`;
        }

        // Start the countdown
        setInterval(updateCountdown, 1000);
        updateCountdown(); // Run immediately
    }

    // WordPress-safe initialization
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initFoundersCountdown();
    } else {
        document.addEventListener('DOMContentLoaded', initFoundersCountdown);
    }
})();
