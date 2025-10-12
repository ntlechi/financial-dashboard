// Early Adopter Countdown Timer - WORKING VERSION (Based on Founder's Circle)
// Paste this code into Code Snippets plugin (without the <script> tags)

(function() {
    console.log('🚀 Early Adopter countdown starting...');
    
    // Global variables for debugging
    let countdownInterval = null;
    let updateCount = 0;
    
    function initEarlyAdopterCountdown() {
        console.log('🔧 Initializing Early Adopter countdown...');
        
        const countdownElement = document.getElementById('early-adopter-countdown-timer');
        
        if (!countdownElement) {
            console.log('❌ Early Adopter countdown element not found');
            return;
        }

        console.log('✅ Early Adopter countdown element found');

        // Set end date (January 1st, 2026 at midnight)
        const endDate = new Date('2026-01-01T00:00:00');
        
        console.log('📅 End date set to:', endDate);

        function updateCountdown() {
            updateCount++;
            console.log(`🔄 Early Adopter Update #${updateCount} - Current time:`, new Date());
            
            const now = new Date();
            const timeRemaining = endDate - now;

            if (timeRemaining <= 0) {
                countdownElement.textContent = 'Offer Ended';
                clearInterval(countdownInterval);
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

            const newTime = `${days}d ${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`;
            countdownElement.textContent = newTime;
            
            console.log(`⏰ Early Adopter updated to: ${newTime}`);
        }

        // Clear any existing interval
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        // Start the countdown
        console.log('🚀 Starting Early Adopter setInterval...');
        countdownInterval = setInterval(updateCountdown, 1000);
        
        // Run immediately
        console.log('🏃 Running first Early Adopter update...');
        updateCountdown();
        
        console.log('✅ Early Adopter countdown started successfully');
    }

    // Simple initialization - no complex checks
    console.log('📋 Document ready state:', document.readyState);
    
    if (document.readyState === 'loading') {
        console.log('⏳ Document still loading, waiting for DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🎯 DOMContentLoaded fired');
            initEarlyAdopterCountdown();
        });
    } else {
        console.log('🎯 Document already ready, initializing immediately...');
        initEarlyAdopterCountdown();
    }
})();
