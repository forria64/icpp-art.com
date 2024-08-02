        document.addEventListener('DOMContentLoaded', function () {
            let currentSlide = 0;
            const slides = document.querySelectorAll('.slide');
            const totalSlides = slides.length;

            const nextBtn = document.getElementById('nextBtn');
            const prevBtn = document.getElementById('prevBtn');

            function updateNavigationButtons() {
                prevBtn.style.display = currentSlide === 0 ? 'none' : 'inline-block';
                nextBtn.style.display = currentSlide === totalSlides - 1 ? 'none' : 'inline-block';
            }

            function goToSlide(n) {
                slides[currentSlide].classList.remove('active');
                currentSlide = (n + totalSlides) % totalSlides;
                slides[currentSlide].classList.add('active');
                updateNavigationButtons();
            }

            nextBtn.addEventListener('click', () => {
                goToSlide(currentSlide + 1);
            });

            prevBtn.addEventListener('click', () => {
                goToSlide(currentSlide - 1);
            });

            // Initialize the first slide and buttons
            updateNavigationButtons();
            goToSlide(currentSlide);
        });
