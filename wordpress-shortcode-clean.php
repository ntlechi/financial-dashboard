<?php
// Add this to your WordPress theme's functions.php file

function survive_pricing_shortcode($atts) {
    $atts = shortcode_atts(array(
        'phase' => '1',
        'spots' => '25'
    ), $atts);
    
    $phase = $atts['phase'];
    $spots = $atts['spots'];
    
    if ($phase == '1') {
        return get_founders_circle_html($spots);
    } elseif ($phase == '2') {
        return get_early_adopter_html($spots);
    } else {
        return get_regular_pricing_html();
    }
}

function get_founders_circle_html($spots) {
    ob_start();
    ?>
    <div id="survive-pricing-container" style="background-color: #111827; color: #f3f4f6; min-height: 100vh; padding: 2rem 1rem; font-family: Arial, sans-serif;">
        <div style="max-width: 1200px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 4rem;">
                <h1 style="font-size: 3rem; font-weight: 900; color: white; margin-bottom: 1.5rem;">Choose Your Gear. Start Your Climb.</h1>
                <p style="font-size: 1.25rem; color: #9ca3af; margin-bottom: 2.5rem;">Start for free, and when you're ready, join the Founder's Circle to get lifetime access to our most powerful tools.</p>

                <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 3rem;">
                    <span id="monthly-label" style="font-size: 1.125rem; font-weight: 700; color: white;">Monthly</span>
                    <div style="position: relative;">
                        <input type="checkbox" id="billing-toggle" style="position: absolute; opacity: 0;" onchange="updatePrices()">
                        <label for="billing-toggle" style="display: flex; align-items: center; cursor: pointer;">
                            <div style="position: relative;">
                                <div style="width: 3.5rem; height: 2rem; background-color: #4b5563; border-radius: 9999px; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);"></div>
                                <div id="toggle-dot" style="position: absolute; top: 0.25rem; left: 0.25rem; width: 1.5rem; height: 1.5rem; background-color: white; border-radius: 9999px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); transform: translateX(0); transition: transform 300ms ease-in-out;"></div>
                            </div>
                        </label>
                    </div>
                    <span id="annual-label" style="font-size: 1.125rem; font-weight: 700; color: #9ca3af;">
                        Annual
                        <span style="font-size: 0.875rem; font-weight: 600; background-color: #059669; color: #d1fae5; padding: 0.25rem 0.5rem; border-radius: 9999px; margin-left: 0.25rem;">Save ~17%</span>
                    </span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; align-items: stretch;">

                <div style="background-color: #1f2937; border-radius: 1rem; padding: 2rem; border: 1px solid #374151; position: relative; display: flex; flex-direction: column;">
                    <div style="position: absolute; top: 1.5rem; right: 1.5rem;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em;">THE RECON KIT</span>
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1rem; margin-top: 1.5rem;">"The Recruit"</h3>
                    <p style="color: #9ca3af; margin-bottom: 1.5rem;">Get your financial bearings. Free forever.</p>
                    <div style="font-size: 3rem; font-weight: 900; color: white; margin-bottom: 1.5rem;">$0</div>
                    <a href="https://app.survivebackpacking.com" style="width: 100%; background-color: #374151; color: white; font-weight: 700; padding: 1rem 1.5rem; border-radius: 0.5rem; text-align: center; display: block; text-decoration: none; transition: all 300ms; margin-top: auto;" onmouseover="this.style.backgroundColor='#4b5563'; this.style.transform='scale(1.05)'" onmouseout="this.style.backgroundColor='#374151'; this.style.transform='scale(1)'">
                        Start Your Recon
                    </a>
                </div>

                <div style="background-color: #1f2937; border-radius: 1rem; padding: 2rem; border: 1px solid #374151; position: relative; display: flex; flex-direction: column;">
                    <div style="position: absolute; top: 1.5rem; right: 1.5rem;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em;">THE CLIMBER PLAN</span>
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1rem; margin-top: 1.5rem;">"The Climber"</h3>
                    <p style="color: #9ca3af; margin-bottom: 1.5rem;">The essential gear for the ascent.</p>
                    <div style="margin-bottom: 1.5rem;">
                        <span id="climber-price" style="font-size: 3rem; font-weight: 900; color: white;">$7.99</span>
                        <span id="climber-period" style="color: #9ca3af;">USD / month</span>
                    </div>
                    <a href="https://buy.stripe.com/fZu9ANe1ge3F07Q6aX7bW05" id="climber-link" style="width: 100%; background-color: #374151; color: white; font-weight: 700; padding: 1rem 1.5rem; border-radius: 0.5rem; text-align: center; display: block; text-decoration: none; transition: all 300ms; margin-top: auto;" onmouseover="this.style.backgroundColor='#4b5563'; this.style.transform='scale(1.05)'" onmouseout="this.style.backgroundColor='#374151'; this.style.transform='scale(1)'">
                        Begin the Climb
                    </a>
                </div>

                <div style="background-color: #1f2937; border-radius: 1rem; padding: 2rem; border: 1px solid #374151; position: relative; display: flex; flex-direction: column;">
                    <div style="position: absolute; top: 1.5rem; right: 1.5rem;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em;">THE OPERATOR PLAN</span>
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1rem; margin-top: 1.5rem;">"The Operator"</h3>
                    <p style="color: #9ca3af; margin-bottom: 1.5rem;">The full arsenal for building your empire.</p>
                    <div style="margin-bottom: 1.5rem;">
                        <span id="operator-price" style="font-size: 3rem; font-weight: 900; color: white;">$14.99</span>
                        <span id="operator-period" style="color: #9ca3af;">USD / month</span>
                    </div>
                    <a href="https://buy.stripe.com/aFa6oB1eu6Bd2fY6aX7bW03" id="operator-link" style="width: 100%; background-color: #374151; color: white; font-weight: 700; padding: 1rem 1.5rem; border-radius: 0.5rem; text-align: center; display: block; text-decoration: none; transition: all 300ms; margin-top: auto;" onmouseover="this.style.backgroundColor='#4b5563'; this.style.transform='scale(1.05)'" onmouseout="this.style.backgroundColor='#374151'; this.style.transform='scale(1)'">
                        Become an Operator
                    </a>
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, #1f2937 100%); border-radius: 1rem; padding: 2rem; border: 2px solid #f59e0b; position: relative;">
                    <div style="position: absolute; top: 1.5rem; right: 1.5rem;">
                        <span style="background-color: #f59e0b; color: #111827; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">Limited Time</span>
                    </div>
                    
                    <h3 style="font-size: 1.875rem; font-weight: 900; color: #f59e0b; margin-bottom: 0.75rem;">The Founder's Circle</h3>
                    <p style="color: #d1d5db; margin-bottom: 1.5rem;">Get a lifetime price lock on The Operator Plan. This is a no-brainer.</p>
                    
                    <div style="font-size: 3rem; font-weight: 900; color: #f59e0b; margin-bottom: 0.5rem;">$7.49<span style="color: #9ca3af; font-size: 1.25rem;">USD / month</span></div>
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
                        <span style="font-size: 1.125rem; color: #6b7280; text-decoration: line-through;">$14.99</span>
                        <span style="background-color: #059669; color: white; font-size: 0.875rem; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">Save 50%</span>
                    </div>
                    
                    <div style="background-color: #111827; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; border: 1px solid #374151;">
                        <div style="font-size: 0.875rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 0.25rem;">Offer Ends In:</div>
                        <div id="countdown-timer" style="font-size: 1.5rem; font-weight: 700; color: #f59e0b; letter-spacing: 0.05em;">15d 10h 46m 23s</div>
                    </div>
                    
                    <div style="background-color: #111827; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; border: 1px solid #374151;">
                        <div style="font-size: 0.875rem; color: #d1d5db; margin-bottom: 0.5rem; font-weight: 500;">
                            <span id="spots-claimed"><?php echo $spots; ?></span> of 100 Founder's Circle spots claimed
                        </div>
                        <div style="width: 100%; background-color: #374151; border-radius: 9999px; height: 0.5rem;">
                            <div id="progress-bar" style="background-color: #f59e0b; height: 0.5rem; border-radius: 9999px; transition: all 500ms; width: <?php echo ($spots / 100) * 100; ?>%"></div>
                        </div>
                    </div>
                    
                    <ul style="list-style: none; padding: 0; margin: 0 0 2rem 0;">
                        <li style="display: flex; align-items: flex-start; margin-bottom: 0.75rem;">
                            <svg style="width: 1.25rem; height: 1.25rem; color: #f59e0b; margin-right: 0.75rem; margin-top: 0.125rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span style="color: #d1d5db;"><strong>Everything in The Operator Plan</strong> (Side Hustle, Investments, Travel, Field Notes).</span>
                        </li>
                        <li style="display: flex; align-items: flex-start; margin-bottom: 0.75rem;">
                            <svg style="width: 1.25rem; height: 1.25rem; color: #f59e0b; margin-right: 0.75rem; margin-top: 0.125rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span style="color: #d1d5db;">A permanent price lock. You will <strong>never</strong> pay the full $14.99 USD / month.</span>
                        </li>
                        <li style="display: flex; align-items: flex-start; margin-bottom: 0.75rem;">
                            <svg style="width: 1.25rem; height: 1.25rem; color: #f59e0b; margin-right: 0.75rem; margin-top: 0.125rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span style="color: #d1d5db;">Exclusive access to our private community of financial operators.</span>
                        </li>
                        <li style="display: flex; align-items: flex-start; margin-bottom: 0.75rem;">
                            <svg style="width: 1.25rem; height: 1.25rem; color: #f59e0b; margin-right: 0.75rem; margin-top: 0.125rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span style="color: #d1d5db;">Priority support and feature requests.</span>
                        </li>
                    </ul>
                    
                    <a href="https://buy.stripe.com/fZueV7bT82kX3k22YL7bW02" style="width: 100%; background-color: #f59e0b; color: #111827; font-weight: 700; padding: 1rem 1.5rem; border-radius: 0.5rem; text-align: center; display: block; text-decoration: none; transition: all 300ms;" onmouseover="this.style.backgroundColor='#d97706'; this.style.transform='scale(1.05)'" onmouseout="this.style.backgroundColor='#f59e0b'; this.style.transform='scale(1)'">
                        Claim Your Founder's Spot
                    </a>
                </div>
            </div>

            <div style="text-align: center; margin-top: 3rem;">
                <p style="color: #9ca3af; max-width: 64rem; margin: 0 auto;">
                    All paid plans are backed by our <strong style="color: white;">Mission Success Guarantee</strong>: Try it for 30 days. If it doesn't give you more clarity and control than any finance app you've used before, you get your money back. No hassle. No questions.
                </p>
            </div>
        </div>
    </div>

    <script>
    var isAnnual = false;
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 15);
    endDate.setHours(23, 59, 59, 999);

    var prices = {
        climber: { monthly: 7.99, annual: 79 },
        operator: { monthly: 14.99, annual: 149 }
    };

    var links = {
        climber: {
            monthly: 'https://buy.stripe.com/fZu9ANe1ge3F07Q6aX7bW05',
            annual: 'https://buy.stripe.com/9B628l8GWaRtbQyard7bW06'
        },
        operator: {
            monthly: 'https://buy.stripe.com/aFa6oB1eu6Bd2fY6aX7bW03',
            annual: 'https://buy.stripe.com/4gM8wJ6yOcZBcUC0QD7bW04'
        }
    };

    function updatePrices() {
        var toggle = document.getElementById('billing-toggle');
        isAnnual = toggle.checked;

        var climberPrice = document.getElementById('climber-price');
        var climberPeriod = document.getElementById('climber-period');
        var climberLink = document.getElementById('climber-link');

        var operatorPrice = document.getElementById('operator-price');
        var operatorPeriod = document.getElementById('operator-period');
        var operatorLink = document.getElementById('operator-link');

        var monthlyLabel = document.getElementById('monthly-label');
        var annualLabel = document.getElementById('annual-label');
        var toggleDot = document.getElementById('toggle-dot');

        if (isAnnual) {
            climberPrice.textContent = '$' + prices.climber.annual;
            climberPeriod.textContent = 'USD / year';
            climberLink.href = links.climber.annual;

            operatorPrice.textContent = '$' + prices.operator.annual;
            operatorPeriod.textContent = 'USD / year';
            operatorLink.href = links.operator.annual;

            monthlyLabel.style.color = '#9ca3af';
            annualLabel.style.color = 'white';
            toggleDot.style.transform = 'translateX(1.5rem)';
        } else {
            climberPrice.textContent = '$' + prices.climber.monthly;
            climberPeriod.textContent = 'USD / month';
            climberLink.href = links.climber.monthly;

            operatorPrice.textContent = '$' + prices.operator.monthly;
            operatorPeriod.textContent = 'USD / month';
            operatorLink.href = links.operator.monthly;

            monthlyLabel.style.color = 'white';
            annualLabel.style.color = '#9ca3af';
            toggleDot.style.transform = 'translateX(0)';
        }
    }

    function updateCountdown() {
        var countdownElement = document.getElementById('countdown-timer');
        if (countdownElement) {
            var now = new Date();
            var timeRemaining = endDate - now;

            if (timeRemaining <= 0) {
                countdownElement.textContent = 'Offer Ended';
                return;
            }

            var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            var hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            var formattedHours = hours.toString();
            var formattedMinutes = minutes.toString();
            var formattedSeconds = seconds.toString();

            if (hours < 10) formattedHours = '0' + formattedHours;
            if (minutes < 10) formattedMinutes = '0' + formattedMinutes;
            if (seconds < 10) formattedSeconds = '0' + formattedSeconds;

            countdownElement.textContent = days + 'd ' + formattedHours + 'h ' + formattedMinutes + 'm ' + formattedSeconds + 's';
        }
    }

    function initializePricing() {
        updatePrices();
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePricing);
    } else {
        initializePricing();
    }
    </script>
    <?php
    return ob_get_clean();
}

function get_early_adopter_html($spots) {
    return '<p>Early Adopter phase coming soon...</p>';
}

function get_regular_pricing_html() {
    return '<p>Regular pricing phase coming soon...</p>';
}

add_shortcode('survive_pricing', 'survive_pricing_shortcode');
?>

