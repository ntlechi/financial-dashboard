<?php
function survive_pricing_shortcode($atts) {
    $atts = shortcode_atts(array(
        'spots' => '25'
    ), $atts);
    
    $spots = $atts['spots'];
    
    $html = '<div style="background-color: #111827; color: white; padding: 20px; font-family: Arial, sans-serif;">';
    $html .= '<h1 style="color: #f59e0b; text-align: center;">Choose Your Gear. Start Your Climb.</h1>';
    
    $html .= '<div style="text-align: center; margin: 20px 0;">';
    $html .= '<span id="monthly-label" style="color: white; margin-right: 10px;">Monthly</span>';
    $html .= '<input type="checkbox" id="billing-toggle" onchange="updatePrices()" style="margin: 0 10px;">';
    $html .= '<span id="annual-label" style="color: #9ca3af;">Annual</span>';
    $html .= '</div>';
    
    $html .= '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0;">';
    
    $html .= '<div style="background-color: #1f2937; padding: 20px; border-radius: 10px; border: 1px solid #374151;">';
    $html .= '<h3 style="color: #f59e0b;">The Recruit</h3>';
    $html .= '<p style="color: #9ca3af;">Free forever</p>';
    $html .= '<div style="font-size: 2rem; font-weight: bold; color: white;">$0</div>';
    $html .= '<a href="https://app.survivebackpacking.com" style="display: block; background-color: #374151; color: white; padding: 10px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 10px;">Start Your Recon</a>';
    $html .= '</div>';
    
    $html .= '<div style="background-color: #1f2937; padding: 20px; border-radius: 10px; border: 1px solid #374151;">';
    $html .= '<h3 style="color: #f59e0b;">The Climber</h3>';
    $html .= '<p style="color: #9ca3af;">Essential gear for the ascent</p>';
    $html .= '<div style="font-size: 2rem; font-weight: bold; color: white;">';
    $html .= '<span id="climber-price">$7.99</span>';
    $html .= '<span id="climber-period" style="font-size: 1rem; color: #9ca3af;">/ month</span>';
    $html .= '</div>';
    $html .= '<a href="https://buy.stripe.com/fZu9ANe1ge3F07Q6aX7bW05" id="climber-link" style="display: block; background-color: #374151; color: white; padding: 10px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 10px;">Begin the Climb</a>';
    $html .= '</div>';
    
    $html .= '<div style="background-color: #1f2937; padding: 20px; border-radius: 10px; border: 1px solid #374151;">';
    $html .= '<h3 style="color: #f59e0b;">The Operator</h3>';
    $html .= '<p style="color: #9ca3af;">Full arsenal for building your empire</p>';
    $html .= '<div style="font-size: 2rem; font-weight: bold; color: white;">';
    $html .= '<span id="operator-price">$14.99</span>';
    $html .= '<span id="operator-period" style="font-size: 1rem; color: #9ca3af;">/ month</span>';
    $html .= '</div>';
    $html .= '<a href="https://buy.stripe.com/aFa6oB1eu6Bd2fY6aX7bW03" id="operator-link" style="display: block; background-color: #374151; color: white; padding: 10px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 10px;">Become an Operator</a>';
    $html .= '</div>';
    
    $html .= '<div style="background-color: #1f2937; padding: 20px; border-radius: 10px; border: 2px solid #f59e0b;">';
    $html .= '<h3 style="color: #f59e0b;">The Founder\'s Circle</h3>';
    $html .= '<p style="color: #d1d5db;">Lifetime price lock</p>';
    $html .= '<div style="font-size: 2rem; font-weight: bold; color: #f59e0b;">$7.49<span style="font-size: 1rem; color: #9ca3af;">/ month</span></div>';
    
    $html .= '<div style="background-color: #111827; padding: 10px; border-radius: 5px; margin: 10px 0;">';
    $html .= '<div style="font-size: 0.8rem; color: #9ca3af;">Offer Ends In:</div>';
    $html .= '<div id="countdown-timer" style="font-size: 1.2rem; color: #f59e0b;">15d 10h 46m 23s</div>';
    $html .= '</div>';
    
    $html .= '<div style="background-color: #111827; padding: 10px; border-radius: 5px; margin: 10px 0;">';
    $html .= '<div style="font-size: 0.8rem; color: #d1d5db;">' . $spots . ' of 100 spots claimed</div>';
    $percentage = ($spots / 100) * 100;
    $html .= '<div style="width: 100%; background-color: #374151; height: 8px; border-radius: 4px; margin-top: 5px;">';
    $html .= '<div id="progress-bar" style="background-color: #f59e0b; height: 8px; border-radius: 4px; width: ' . $percentage . '%;"></div>';
    $html .= '</div>';
    $html .= '</div>';
    
    $html .= '<a href="https://buy.stripe.com/fZueV7bT82kX3k22YL7bW02" style="display: block; background-color: #f59e0b; color: #111827; padding: 10px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">Claim Your Founder\'s Spot</a>';
    $html .= '</div>';
    $html .= '</div>';
    
    $html .= '<script>';
    $html .= 'var isAnnual = false;';
    $html .= 'var endDate = new Date();';
    $html .= 'endDate.setDate(endDate.getDate() + 15);';
    $html .= 'endDate.setHours(23, 59, 59, 999);';
    
    $html .= 'var prices = {';
    $html .= 'climber: { monthly: 7.99, annual: 79 },';
    $html .= 'operator: { monthly: 14.99, annual: 149 }';
    $html .= '};';
    
    $html .= 'var links = {';
    $html .= 'climber: {';
    $html .= 'monthly: "https://buy.stripe.com/fZu9ANe1ge3F07Q6aX7bW05",';
    $html .= 'annual: "https://buy.stripe.com/9B628l8GWaRtbQyard7bW06"';
    $html .= '},';
    $html .= 'operator: {';
    $html .= 'monthly: "https://buy.stripe.com/aFa6oB1eu6Bd2fY6aX7bW03",';
    $html .= 'annual: "https://buy.stripe.com/4gM8wJ6yOcZBcUC0QD7bW04"';
    $html .= '}';
    $html .= '};';
    
    $html .= 'function updatePrices() {';
    $html .= 'var toggle = document.getElementById("billing-toggle");';
    $html .= 'isAnnual = toggle.checked;';
    $html .= 'var climberPrice = document.getElementById("climber-price");';
    $html .= 'var climberPeriod = document.getElementById("climber-period");';
    $html .= 'var climberLink = document.getElementById("climber-link");';
    $html .= 'var operatorPrice = document.getElementById("operator-price");';
    $html .= 'var operatorPeriod = document.getElementById("operator-period");';
    $html .= 'var operatorLink = document.getElementById("operator-link");';
    $html .= 'var monthlyLabel = document.getElementById("monthly-label");';
    $html .= 'var annualLabel = document.getElementById("annual-label");';
    $html .= 'if (isAnnual) {';
    $html .= 'climberPrice.textContent = "$" + prices.climber.annual;';
    $html .= 'climberPeriod.textContent = "/ year";';
    $html .= 'climberLink.href = links.climber.annual;';
    $html .= 'operatorPrice.textContent = "$" + prices.operator.annual;';
    $html .= 'operatorPeriod.textContent = "/ year";';
    $html .= 'operatorLink.href = links.operator.annual;';
    $html .= 'monthlyLabel.style.color = "#9ca3af";';
    $html .= 'annualLabel.style.color = "white";';
    $html .= '} else {';
    $html .= 'climberPrice.textContent = "$" + prices.climber.monthly;';
    $html .= 'climberPeriod.textContent = "/ month";';
    $html .= 'climberLink.href = links.climber.monthly;';
    $html .= 'operatorPrice.textContent = "$" + prices.operator.monthly;';
    $html .= 'operatorPeriod.textContent = "/ month";';
    $html .= 'operatorLink.href = links.operator.monthly;';
    $html .= 'monthlyLabel.style.color = "white";';
    $html .= 'annualLabel.style.color = "#9ca3af";';
    $html .= '}';
    $html .= '}';
    
    $html .= 'function updateCountdown() {';
    $html .= 'var countdownElement = document.getElementById("countdown-timer");';
    $html .= 'if (countdownElement) {';
    $html .= 'var now = new Date();';
    $html .= 'var timeRemaining = endDate - now;';
    $html .= 'if (timeRemaining <= 0) {';
    $html .= 'countdownElement.textContent = "Offer Ended";';
    $html .= 'return;';
    $html .= '}';
    $html .= 'var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));';
    $html .= 'var hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));';
    $html .= 'var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));';
    $html .= 'var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);';
    $html .= 'var formattedHours = hours < 10 ? "0" + hours : hours;';
    $html .= 'var formattedMinutes = minutes < 10 ? "0" + minutes : minutes;';
    $html .= 'var formattedSeconds = seconds < 10 ? "0" + seconds : seconds;';
    $html .= 'countdownElement.textContent = days + "d " + formattedHours + "h " + formattedMinutes + "m " + formattedSeconds + "s";';
    $html .= '}';
    $html .= '}';
    
    $html .= 'function init() {';
    $html .= 'updatePrices();';
    $html .= 'setInterval(updateCountdown, 1000);';
    $html .= 'updateCountdown();';
    $html .= '}';
    
    $html .= 'if (document.readyState === "loading") {';
    $html .= 'document.addEventListener("DOMContentLoaded", init);';
    $html .= '} else {';
    $html .= 'init();';
    $html .= '}';
    $html .= '</script>';
    
    return $html;
}

add_shortcode('survive_pricing', 'survive_pricing_shortcode');
?>


