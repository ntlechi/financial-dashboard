<?php
function survive_pricing_shortcode($atts) {
    $atts = shortcode_atts(array(
        'phase' => '1',
        'spots' => '25'
    ), $atts);
    
    $phase = $atts['phase'];
    $spots = $atts['spots'];
    
    ob_start();
    ?>
    <div style="background-color: #111827; color: white; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #f59e0b; text-align: center;">Choose Your Gear. Start Your Climb.</h1>
        
        <div style="text-align: center; margin: 20px 0;">
            <span id="monthly-label" style="color: white; margin-right: 10px;">Monthly</span>
            <input type="checkbox" id="billing-toggle" onchange="updatePrices()" style="margin: 0 10px;">
            <span id="annual-label" style="color: #9ca3af;">Annual</span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0;">
            
            <div style="background-color: #1f2937; padding: 20px; border-radius: 10px; border: 1px solid #374151;">
                <h3 style="color: #f59e0b;">The Recruit</h3>
                <p style="color: #9ca3af;">Free forever</p>
                <div style="font-size: 2rem; font-weight: bold; color: white;">$0</div>
                <a href="https://app.survivebackpacking.com" style="display: block; background-color: #374151; color: white; padding: 10px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 10px;">Start Your Recon</a>
            </div>
            
            <div style="background-color: #1f2937; padding: 20px; border-radius: 10px; border: 1px solid #374151;">
                <h3 style="color: #f59e0b;">The Climber</h3>
                <p style="color: #9ca3af;">Essential gear for the ascent</p>
                <div style="font-size: 2rem; font-weight: bold; color: white;">
                    <span id="climber-price">$7.99</span>
                    <span id="climber-period" style="font-size: 1rem; color: #9ca3af;">/ month</span>
                </div>
                <a href="https://buy.stripe.com/fZu9ANe1ge3F07Q6aX7bW05" id="climber-link" style="display: block; background-color: #374151; color: white; padding: 10px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 10px;">Begin the Climb</a>
            </div>
            
            <div style="background-color: #1f2937; padding: 20px; border-radius: 10px; border: 1px solid #374151;">
                <h3 style="color: #f59e0b;">The Operator</h3>
                <p style="color: #9ca3af;">Full arsenal for building your empire</p>
                <div style="font-size: 2rem; font-weight: bold; color: white;">
                    <span id="operator-price">$14.99</span>
                    <span id="operator-period" style="font-size: 1rem; color: #9ca3af;">/ month</span>
                </div>
                <a href="https://buy.stripe.com/aFa6oB1eu6Bd2fY6aX7bW03" id="operator-link" style="display: block; background-color: #374151; color: white; padding: 10px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 10px;">Become an Operator</a>
            </div>
            
            <div style="background-color: #1f2937; padding: 20px; border-radius: 10px; border: 2px solid #f59e0b;">
                <h3 style="color: #f59e0b;">The Founder's Circle</h3>
                <p style="color: #d1d5db;">Lifetime price lock</p>
                <div style="font-size: 2rem; font-weight: bold; color: #f59e0b;">$7.49<span style="font-size: 1rem; color: #9ca3af;">/ month</span></div>
                
                <div style="background-color: #111827; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <div style="font-size: 0.8rem; color: #9ca3af;">Offer Ends In:</div>
                    <div id="countdown-timer" style="font-size: 1.2rem; color: #f59e0b;">15d 10h 46m 23s</div>
                </div>
                
                <div style="background-color: #111827; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <div style="font-size: 0.8rem; color: #d1d5db;">
                        <span id="spots-claimed"><?php echo $spots; ?></span> of 100 spots claimed
                    </div>
                    <div style="width: 100%; background-color: #374151; height: 8px; border-radius: 4px; margin-top: 5px;">
                        <div id="progress-bar" style="background-color: #f59e0b; height: 8px; border-radius: 4px; width: <?php echo ($spots / 100) * 100; ?>%;"></div>
                    </div>
                </div>
                
                <a href="https://buy.stripe.com/fZueV7bT82kX3k22YL7bW02" style="display: block; background-color: #f59e0b; color: #111827; padding: 10px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">Claim Your Founder's Spot</a>
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

        if (isAnnual) {
            climberPrice.textContent = '$' + prices.climber.annual;
            climberPeriod.textContent = '/ year';
            climberLink.href = links.climber.annual;

            operatorPrice.textContent = '$' + prices.operator.annual;
            operatorPeriod.textContent = '/ year';
            operatorLink.href = links.operator.annual;

            monthlyLabel.style.color = '#9ca3af';
            annualLabel.style.color = 'white';
        } else {
            climberPrice.textContent = '$' + prices.climber.monthly;
            climberPeriod.textContent = '/ month';
            climberLink.href = links.climber.monthly;

            operatorPrice.textContent = '$' + prices.operator.monthly;
            operatorPeriod.textContent = '/ month';
            operatorLink.href = links.operator.monthly;

            monthlyLabel.style.color = 'white';
            annualLabel.style.color = '#9ca3af';
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

            var formattedHours = hours < 10 ? '0' + hours : hours;
            var formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            var formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

            countdownElement.textContent = days + 'd ' + formattedHours + 'h ' + formattedMinutes + 'm ' + formattedSeconds + 's';
        }
    }

    function init() {
        updatePrices();
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    </script>
    <?php
    return ob_get_clean();
}

add_shortcode('survive_pricing', 'survive_pricing_shortcode');
?>


