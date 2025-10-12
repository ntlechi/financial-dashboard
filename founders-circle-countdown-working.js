// Founders Circle Countdown Timer - WORKING VERSION
// Paste this code into Code Snippets plugin (without the <script> tags)

(function() {
    console.log('🚀 Founders Circle countdown starting...');
    
    // Global variables for debugging
    let countdownInterval = null;
    let updateCount = 0;
    
    function initFoundersCountdown() {
        console.log('🔧 Initializing Founders Circle countdown...');
        
        const countdownElement = document.getElementById('founders-countdown-timer');
        
        if (!countdownElement) {
            console.log('❌ Founders countdown element not found');
            return;
        }

        console.log('✅ Founders countdown element found');

        // Set end date (15 days from now at 11:59:59 PM)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 15);
        endDate.setHours(23, 59, 59, 999);
        
        console.log('📅 End date set to:', endDate);

        function updateCountdown() {
            updateCount++;
            console.log(`🔄 Founders Update #${updateCount} - Current time:`, new Date());
            
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
            
            console.log(`⏰ Founders updated to: ${newTime}`);
        }

        // Clear any existing interval
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        // Start the countdown
        console.log('🚀 Starting Founders setInterval...');
        countdownInterval = setInterval(updateCountdown, 1000);
        
        // Run immediately
        console.log('🏃 Running first Founders update...');
        updateCountdown();
        
        console.log('✅ Founders Circle countdown started successfully');
    }

    // Simple initialization - no complex checks
    console.log('📋 Document ready state:', document.readyState);
    
    if (document.readyState === 'loading') {
        console.log('⏳ Document still loading, waiting for DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🎯 DOMContentLoaded fired');
            initFoundersCountdown();
        });
    } else {
        console.log('🎯 Document already ready, initializing immediately...');
        initFoundersCountdown();
    }
})();
