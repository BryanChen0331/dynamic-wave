document.addEventListener("DOMContentLoaded", function(){
    const $blueScore = document.querySelector("#blue-score");
    const $yellowScore = document.querySelector("#yellow-score");

    const eventSource = new EventSource("/sse");

    eventSource.onmessage = function(event) {
        const totals = JSON.parse(event.data);
        updateTotals(totals);
    };

    function updateTotals(totals) {
        $blueScore.innerHTML = totals.blueTotal;
        $yellowScore.innerHTML = totals.yellowTotal;
    }

    fetch('/api/score')
        .then(response => response.json())
        .then(updateTotals);

    const $clock = document.querySelector("#clock");
    const targetDate = new Date('2024-07-06T10:00:00');

    function updateCountdown() {
        const currentDate = new Date();
        const timeDifference = targetDate - currentDate;
    
        if (timeDifference <= 0) {
            $clock.innerHTML = `0d 0h 0m 0s`;
        } else {
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    
        $clock.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    }
    
    setInterval(updateCountdown, 1000);

    const $hamburger = document.querySelector("#hamburger");
    const $navItems = document.querySelector("#nav-items");

    $hamburger.addEventListener("click", function() {
        $navItems.classList.toggle("show");
    });

    function updateClockFontSize() {
        const $container = document.querySelector("#container");
        const $clock = document.querySelector("#clock");
        const containerWidth = $container.offsetWidth;
        const fontSize = containerWidth / 15;
        
        $clock.style.fontSize = `${fontSize}px`;
    }

    function updateScoreFontSize() {
        const $container = document.querySelector("#container");
        const $blueScore = document.querySelector("#blue-score");
        const $yellowScore = document.querySelector("#yellow-score");
        const containerWidth = $container.offsetWidth;
        const fontSize = containerWidth / 10;
        
        $blueScore.style.fontSize = `${fontSize}px`;
        $yellowScore.style.fontSize = `${fontSize}px`;
    }
    
    updateClockFontSize()
    updateScoreFontSize();

    window.addEventListener("resize", () => {
        updateClockFontSize()
        updateScoreFontSize();
    });
});