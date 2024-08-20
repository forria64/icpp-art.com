  // Select all elements with the class 'image-slider'
  var sliders = document.querySelectorAll('.image-slider');

  // Loop through each image slider element
  sliders.forEach(function(slider) {
    var images = slider.getAttribute('data-images').split(',').map(function(image) {
      return image.trim(); // Remove leading and trailing whitespace
    });
    var currentIndex = 0;

    function changeImage() {
      slider.src = images[currentIndex];
      currentIndex = (currentIndex + 1) % images.length;
    }

    changeImage();

    setInterval(changeImage, 980);
  });
