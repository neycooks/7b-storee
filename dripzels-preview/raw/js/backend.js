// Error 
function sendError(error) {
  document.getElementById("ErrorMessage").innerHTML = error;
  document.getElementById("section-Popup").style.display = 'flex';
  setTimeout(() => {
    document.getElementById("section-Popup").style.opacity = 1;
  }, 100);

  document.querySelectorAll('.PopupMenu').forEach((menu) => {
    setTimeout(() => {
      menu.style.display = 'flex';
    }, 100);
  })
}


function handleHashChange() {
  const currentHash = window.location.hash;
  const allowedHashes = ["", "#home", "#clothing", "#humanoid", "#robux"];

  if (allowedHashes.includes(currentHash)) {
    changePage(currentHash.substring(1));
  } else {
    sendError("Unknown Hash!");
    window.location.hash = "";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  handleHashChange();
  window.addEventListener("hashchange", handleHashChange);
});

function changePage(page) {
  const navButtons = document.querySelectorAll(".NavButton");
  const optionPages = document.querySelectorAll(".OptionMenu-Page");
  let pageTitle = "Dripzels | Free Roblox Clothing Preview Generator"

  optionPages.forEach((page) => {
    page.style.display = "none";
  });

  navButtons.forEach((btn) => {
    btn.classList.remove("selected");
  });

  switch (page) {
    case "clothing":
    case "humanoid":
    case "robux":
      document.getElementById("OptionPage-" + page).style.display = "flex";
      document.getElementById("NavButton-" + page).classList.add("selected");
      break;
    case "home":
      document.getElementById("OptionPage-" + page).style.display = "flex";
      break;
    case "":
      document.getElementById("NavButton-Preview").classList.add("selected");
      if (screen.width <= 768) {
        toggleOptionMenu("hide");
      } else if (screen.width > 768) {
        document.getElementById("OptionPage-home").style.display = "flex";
      }
      break;
  }
    // Set the dynamic title
    pageTitle = page.charAt(0).toUpperCase() + page.slice(1) + " | Dripzels";
    if(page == 'home' || page == ''){
      pageTitle = "Home | Dripzels";
    }
    document.title = pageTitle;
}


// Toggle Preview Mode 📌
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("PreviewModeToggle");
  const options = Array.from(
    container.getElementsByClassName("PreviewModeToggle-Option")
    );
    
    container.addEventListener("click", function () {
      options.forEach((option) => {
        option.classList.toggle("selected");
    });
    
    // Check which option is selected and log the result
    const selectedOption = options.find((option) =>
    option.classList.contains("selected")
    );
    if (selectedOption) {
      const previewMode = selectedOption.textContent;
      if (previewMode == "2D") {
        document.getElementById("PreviewMode-2D").style.pointerEvents = "all";
        document.querySelector("canvas").style.opacity = 0;
        document.getElementById("PreviewMode-2D").style.opacity = 1;
      } else {
        document.getElementById("PreviewMode-2D").style.pointerEvents = "none";
        document.getElementById("PreviewMode-2D").style.opacity = 0;
        document.querySelector("canvas").style.opacity = 1;
      }
    }
  });
});

// Robux Calculator 📌
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('RobuxInput').addEventListener('input', () => {
    let robuxInput = document.getElementById('RobuxInput');
    
    let robuxValue = parseInt(robuxInput.value, 10);

    if (!isNaN(robuxValue) && Number.isInteger(robuxValue) && robuxValue >= 0) {

      // Calculate how much Robux they get after tax
      let robuxAfterTax = Math.floor(0.7 * robuxValue).toLocaleString();
      let listingPrice = Math.ceil(robuxValue / 0.7).toLocaleString();
      
      // Apply toLocaleString before calling toFixed for DevExUSD
      let devExUSD = (robuxValue / 30000 * 105).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      // Display the results
      document.getElementById('RobuxAfterTax').innerText = robuxAfterTax;
      document.getElementById('ListingPrice').innerText = listingPrice;
      document.getElementById('DevExUSD').innerText = devExUSD;
      
    } else {
      document.getElementById('RobuxAfterTax').innerText = '00';
      document.getElementById('ListingPrice').innerText = '00';
      document.getElementById('DevExUSD').innerText = '00';
    }
  });
});



// Mobile 📌
function toggleOptionMenu(toggle){
  if (toggle == 'hide'){
    document.getElementById('OptionMenu').style.display = 'none'
  }
  else if (toggle == 'show'){
    document.getElementById('OptionMenu').style.display = 'flex'
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if(document.body.offsetWidth <= 768){
    if(window.location.hash == ""){
    toggleOptionMenu('hide')
    }
  }
  let screenWidth = document.body.offsetWidth;
  window.addEventListener('resize', () => {
    if (screenWidth !== screen.width) {
      if (screen.width <= 768) {
        toggleOptionMenu("hide");
      } else {
        toggleOptionMenu("show");
      }
    }
  })
})

