const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.head-right');

hamburger.addEventListener('click', () => {
    menu.classList.toggle('show');
});


/* Countdown Timer ↓ ↓ ↓ */
const countdownDate = new Date("July 31, 2025 19:30:00").getTime();

const countdownFunction = setInterval(() => {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    // 👇 Check if countdown is over BEFORE trying to update numbers
if (distance < 0) {
    
    clearInterval(countdownFunction);
    document.getElementById("countdown").innerHTML = "<h2 style='color: green;'>The event has started!</h2>";
    return; // exit early so nothing else runs
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
}, 1000);


/* Sponsorship link details ↓ ↓ ↓ */
function goToPayment(plan) {
    const paymentLinks = {
        monthly: "https://example.com/payment/monthly",
        termly: "https://example.com/payment/termly",
        annual: "https://example.com/payment/annual"
    };
    window.location.href = paymentLinks[plan];
}

/* Email.js - Contact Information */
(function () {

    emailjs.init("jDX65IbbgE-DOzgDT"); // Replace with your EmailJS user ID
    })();

    document.getElementById('contact-form').addEventListener('submit', function (event) {
      event.preventDefault();


      emailjs.sendForm('service_niaprrm', 'template_qk0hrnt', this)

      .then(function () {
        document.getElementById("thank-you-card").classList.add("show");

        setTimeout(() => { 
            document.getElementById("thank-you-card").classList.remove("show");
        }, 2500);

          document.getElementById('contact-form').reset();
        }, function (error) {
            console.error("FAILED...", error);
            alert("Failed to send message. Please try again later.");
        });
    });