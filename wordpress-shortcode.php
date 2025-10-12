<?php
// Add this to your theme's functions.php file or create a custom plugin

function survive_pricing_shortcode($atts) {
    // Enqueue Google Fonts
    wp_enqueue_style('google-fonts-inter', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    ob_start();
    ?>
    <div id="survive-pricing-component" style="font-family: 'Inter', sans-serif; background: #111827; color: #E5E7EB; padding: 3rem 1rem;">
        <div style="max-width: 1200px; margin: 0 auto;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 3rem;">
                <h2 style="font-size: 3rem; font-weight: 900; color: white; margin-bottom: 1rem; line-height: 1.1;">
                    Choose Your Gear. Start Your Climb.
                </h2>
                <p id="phase-message" style="font-size: 1.125rem; color: #9CA3AF; max-width: 48rem; margin: 0 auto;">
                    Start for free, and when you're ready, join the Founder's Circle to get lifetime access to our most powerful tools.
                </p>
                
                <!-- Billing Toggle -->
                <div style="margin-top: 2rem; display: flex; justify-content: center; align-items: center; gap: 1rem;">
                    <span id="monthly-label" style="font-weight: 700; color: white;">Monthly</span>
                    <label for="billing-toggle" style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="billing-toggle" style="display: none;">
                        <div style="position: relative;">
                            <div style="display: block; background: #4B5563; width: 3.5rem; height: 2rem; border-radius: 9999px;"></div>
                            <div id="toggle-dot" style="position: absolute; left: 0.25rem; top: 0.25rem; background: white; width: 1.5rem; height: 1.5rem; border-radius: 9999px; transition: transform 0.3s ease-in-out;"></div>
                        </div>
                    </label>
                    <span id="annual-label" style="font-weight: 700; color: #9CA3AF;">Annual <span style="font-size: 0.75rem; font-weight: 600; background: #10B981; color: #064E3B; padding: 0.125rem 0.5rem; border-radius: 9999px; margin-left: 0.25rem;">Save ~17%</span></span>
                </div>
            </div>

            <!-- Pricing Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
                
                <!-- Right Column - Founder's Circle -->
                <div style="order: 1;">
                    <div style="background: #1F2937; background: linear-gradient(135deg, rgba(251, 191, 36, 0.03) 0%, #1F2937 100%); border-radius: 1rem; padding: 2rem; border: 2px solid #FBBF24; position: relative; height: 100%; display: flex; flex-direction: column;">
                        <div style="position: absolute; top: 1rem; right: 1rem; background: #FBBF24; color: #111827; padding: 0.5rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
                            Limited Time
                        </div>
                        
                        <div style="margin-bottom: 1.5rem; margin-top: 0.5rem;">
                            <h3 style="font-size: 1.875rem; font-weight: 800; color: #FBBF24; margin-bottom: 0.5rem;">The Founder's Circle</h3>
                            <p style="color: #D1D5DB;">Get a lifetime price lock on The Operator Plan. This is a no-brainer.</p>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <span style="font-size: 3rem; font-weight: 900; color: #FBBF24;">$7.49</span>
                                <span style="color: #9CA3AF;">USD / month</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span style="text-decoration: line-through; color: #6B7280; font-size: 1.125rem;">$14.99</span>
                                <span style="background: #10B981; color: white; font-size: 0.875rem; font-weight: 600; padding: 0.125rem 0.5rem; border-radius: 0.25rem;">Save 50%</span>
                            </div>
                        </div>
                        
                        <!-- Countdown Timer -->
                        <div style="background: #111827; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; border: 1px solid #374151;">
                            <div style="margin-bottom: 1rem;">
                                <p style="font-size: 0.875rem; color: #9CA3AF; margin-bottom: 0.25rem; text-transform: uppercase; font-weight: 600;">Offer Ends In:</p>
                                <div id="countdown-timer" style="font-size: 1.5rem; font-weight: 700; color: #FBBF24; letter-spacing: 0.1em;">15d 10h 46m 23s</div>
                            </div>
                            <div>
                                <p style="font-size: 0.875rem; color: #D1D5DB; margin-bottom: 0.5rem; font-weight: 500;">8 of 100 Founder's Circle spots claimed</p>
                                <div style="background: #374151; border-radius: 9999px; height: 0.5rem; width: 100%; overflow: hidden;">
                                    <div style="background: #FBBF24; height: 100%; border-radius: 9999px; transition: all 0.5s ease; width: 8%;"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Features -->
                        <ul style="list-style: none; padding: 0; margin: 0 0 2rem 0; color: #E5E7EB;">
                            <li style="display: flex; align-items: flex-start; margin-bottom: 0.75rem;">
                                <svg style="width: 1.25rem; height: 1.25rem; color: #FBBF24; margin-right: 0.75rem; margin-top: 0.25rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span><strong>Everything in The Operator Plan</strong> (Side Hustle, Investments, Travel, Field Notes).</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; margin-bottom: 0.75rem;">
                                <svg style="width: 1.25rem; height: 1.25rem; color: #FBBF24; margin-right: 0.75rem; margin-top: 0.25rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>A permanent price lock. You will <strong>never</strong> pay the full $14.99 USD / month.</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; margin-bottom: 0.75rem;">
                                <svg style="width: 1.25rem; height: 1.25rem; color: #FBBF24; margin-right: 0.75rem; margin-top: 0.25rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>Exclusive access to the private "Founder's Circle" Discord community.</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; margin-bottom: 0.75rem;">
                                <svg style="width: 1.25rem; height: 1.25rem; color: #FBBF24; margin-right: 0.75rem; margin-top: 0.25rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>A permanent "Founder" badge on your in-app profile.</span>
                            </li>
                        </ul>
                        
                        <a href="https://buy.stripe.com/fZueV7bT82kX3k22YL7bW02" style="width: 100%; margin-top: auto; background: #FBBF24; color: #111827; padding: 1rem; border-radius: 0.5rem; font-weight: 700; font-size: 1.125rem; text-align: center; text-decoration: none; display: block; transition: all 0.3s ease; transform: scale(1);" onmouseover="this.style.background='#F59E0B'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='#FBBF24'; this.style.transform='scale(1)'">
                            Claim Your Founder's Spot
                        </a>
                    </div>
                </div>
                
                <!-- Left Column - Standard Plans -->
                <div style="order: 2; display: flex; flex-direction: column; gap: 2rem;">
                    
                    <!-- Recon Kit -->
                    <div style="background: #1F2937; border-radius: 1rem; padding: 2rem; border: 1px solid #374151; height: 100%; display: flex; flex-direction: column; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-0.5rem)'; this.style.borderColor='#FBBF24'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='#374151'">
                        <p style="font-size: 0.75rem; font-weight: 700; color: #FBBF24; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem;">THE RECON KIT</p>
                        <h3 style="font-size: 1.5rem; font-weight: 700; color: white;">"The Recruit"</h3>
                        <p style="color: #9CA3AF; margin-top: 0.25rem;">Get your financial bearings. Free forever.</p>
                        <p style="font-size: 3rem; font-weight: 900; color: white; margin: 1.5rem 0;">$0</p>
                        <a href="https://app.survivebackpacking.com" style="width: 100%; margin-top: auto; background: #374151; color: white; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; text-align: center; text-decoration: none; display: block; transition: background-color 0.3s ease;" onmouseover="this.style.background='#4B5563'" onmouseout="this.style.background='#374151'">
                            Start Your Recon
                        </a>
                    </div>
                    
                    <!-- Climber Plan -->
                    <div style="background: #1F2937; border-radius: 1rem; padding: 2rem; border: 1px solid #374151; height: 100%; display: flex; flex-direction: column; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-0.5rem)'; this.style.borderColor='#FBBF24'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='#374151'">
                        <p style="font-size: 0.75rem; font-weight: 700; color: #FBBF24; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem;">THE CLIMBER PLAN</p>
                        <h3 style="font-size: 1.5rem; font-weight: 700; color: white;">"The Climber"</h3>
                        <p style="color: #9CA3AF; margin-top: 0.25rem;">The essential gear for the ascent.</p>
                        <div style="margin: 1.5rem 0;">
                            <p style="display: flex; align-items: baseline;">
                                <span class="price-display" style="font-size: 3rem; font-weight: 900; color: white;">$7.99</span>
                                <span class="billing-period" style="margin-left: 0.5rem; color: #9CA3AF;">USD / month</span>
                            </p>
                        </div>
                        <a href="https://buy.stripe.com/fZu9ANe1ge3F07Q6aX7bW05" class="climber-link" style="width: 100%; margin-top: auto; background: #374151; color: white; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; text-align: center; text-decoration: none; display: block; transition: background-color 0.3s ease;" onmouseover="this.style.background='#4B5563'" onmouseout="this.style.background='#374151'">
                            Begin the Climb
                        </a>
                    </div>
                    
                    <!-- Operator Plan -->
                    <div style="background: #1F2937; border-radius: 1rem; padding: 2rem; border: 1px solid #374151; height: 100%; display: flex; flex-direction: column; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-0.5rem)'; this.style.borderColor='#FBBF24'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='#374151'">
                        <p style="font-size: 0.75rem; font-weight: 700; color: #FBBF24; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem;">THE OPERATOR PLAN</p>
                        <h3 style="font-size: 1.5rem; font-weight: 700; color: white;">"The Operator"</h3>
                        <p style="color: #9CA3AF; margin-top: 0.25rem;">The full arsenal for building your empire.</p>
                        <div style="margin: 1.5rem 0;">
                            <p style="display: flex; align-items: baseline;">
                                <span class="price-display" style="font-size: 3rem; font-weight: 900; color: white;">$14.99</span>
                                <span class="billing-period" style="margin-left: 0.5rem; color: #9CA3AF;">USD / month</span>
                            </p>
                        </div>
                        <a href="https://buy.stripe.com/aFa6oB1eu6Bd2fY6aX7bW03" class="operator-link" style="width: 100%; margin-top: auto; background: #374151; color: white; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; text-align: center; text-decoration: none; display: block; transition: background-color 0.3s ease;" onmouseover="this.style.background='#4B5563'" onmouseout="this.style.background='#374151'">
                            Become an Operator
                        </a>
                    </div>
                    
                </div>
            </div>
            
            <!-- Mission Success Guarantee -->
            <div style="text-align: center; margin-top: 3rem;">
                <p style="color: #9CA3AF; max-width: 64rem; margin: 0 auto;">
                    All paid plans are backed by our <strong style="color: white;">Mission Success Guarantee</strong>: Try it for 30 days. If it doesn't give you more clarity and control than any finance app you've used before, you get your money back. No hassle. No questions.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 3rem;">
                <h3 style="font-size: 1.5rem; font-weight: 700; color: white;">The Complete Operator's Toolkit</h3>
            </div>
        </div>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 WordPress Pricing Shortcode loaded!');
        
        // Billing toggle functionality
        const toggle = document.getElementById('billing-toggle');
        const monthlyLabel = document.getElementById('monthly-label');
        const annualLabel = document.getElementById('annual-label');
        const toggleDot = document.getElementById('toggle-dot');

        const prices = {
            climber: { monthly: 7.99, annual: 79 },
            operator: { monthly: 14.99, annual: 149 }
        };
        
        const links = {
            climber: { 
                monthly: 'https://buy.stripe.com/fZu9ANe1ge3F07Q6aX7bW05', 
                annual: 'https://buy.stripe.com/9B628l8GWaRtbQyard7bW06' 
            },
            operator: { 
                monthly: 'https://buy.stripe.com/aFa6oB1eu6Bd2fY6aX7bW03', 
                annual: 'https://buy.stripe.com/4gM8wJ6yOcZBcUC0QD7bW04' 
            }
        };

        function updatePrices(isAnnual) {
            const priceDisplays = document.querySelectorAll('.price-display');
            const billingPeriods = document.querySelectorAll('.billing-period');
            const climberLink = document.querySelector('.climber-link');
            const operatorLink = document.querySelector('.operator-link');

            if (priceDisplays.length >= 2) {
                // Climber plan
                priceDisplays[0].textContent = isAnnual ? `$${prices.climber.annual}` : `$${prices.climber.monthly}`;
                billingPeriods[0].textContent = isAnnual ? 'USD / year' : 'USD / month';
                if (climberLink) climberLink.href = isAnnual ? links.climber.annual : links.climber.monthly;

                // Operator plan
                priceDisplays[1].textContent = isAnnual ? `$${prices.operator.annual}` : `$${prices.operator.monthly}`;
                billingPeriods[1].textContent = isAnnual ? 'USD / year' : 'USD / month';
                if (operatorLink) operatorLink.href = isAnnual ? links.operator.annual : links.operator.monthly;
            }

            // Update labels
            if (isAnnual) {
                monthlyLabel.style.color = '#9CA3AF';
                annualLabel.style.color = 'white';
                if (toggleDot) toggleDot.style.transform = 'translateX(1.5rem)';
            } else {
                monthlyLabel.style.color = 'white';
                annualLabel.style.color = '#9CA3AF';
                if (toggleDot) toggleDot.style.transform = 'translateX(0)';
            }
        }

        if (toggle) {
            toggle.addEventListener('change', () => updatePrices(toggle.checked));
        }

        // Countdown timer
        function updateCountdown() {
            const countdownElement = document.getElementById('countdown-timer');
            if (countdownElement) {
                const now = new Date();
                const endDate = new Date('2024-10-26T23:59:59.999Z');
                const timeRemaining = endDate - now;

                if (timeRemaining <= 0) {
                    countdownElement.textContent = 'Offer Ended';
                    return;
                }

                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            }
        }

        // Update countdown every second
        setInterval(updateCountdown, 1000);
        updateCountdown();

        console.log('✅ WordPress Pricing Shortcode initialized successfully!');
    });
    </script>
    <?php
    return ob_get_clean();
}

// Register the shortcode
add_shortcode('survive_pricing', 'survive_pricing_shortcode');
?>

