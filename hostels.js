const hostelData = {
  girls: [
    "Kalpana Chawla: AC with attached washroom - 4 sharing",
    "Kalpana Chawla: AC with attached washroom - 4 sharing (Bunker Cot)",
    "Meenakshi: AC with attached washroom - 4 sharing (Bunker Cot)",
    "Meenakshi: Non-AC with attached washroom - 3 sharing",
    "Thamarai: Non-AC with common washroom - 2 sharing",
    "Malligai: Non-AC with common washroom - 2 sharing",
    "Senbagam: Non-AC with common washroom - 3 sharing",
    "Senbagam: Non-AC with common washroom - 6 sharing"
  ],
  boys: [
    "Premium Boys: AC with attached washroom - 3 sharing",
    "Green Pearl (Off-Campus): AC with attached washroom - 3 sharing",
    "Green Pearl (Off-Campus): Non-AC with attached washroom - 3 sharing",
    "Adhiyaman: AC with attached washroom - 2 sharing",
    "Adhiyaman: AC with attached washroom - 3 sharing",
    "Adhiyaman: AC with attached washroom - 4 sharing",
    "Adhiyaman: Non-AC with attached washroom - 3 sharing",
    "Agasthiyar: AC with attached washroom - 4 sharing",
    "Began: AC with common washroom - 3 sharing",
    "Began: Non-AC with common washroom - 2 sharing",
    "Oori: AC with common washroom - 4 & 5 sharing",
    "N Block: Non-AC with attached washroom - 2 sharing",
    "N Block: Non-AC with attached washroom - 3 sharing",
    "Mullai: Non-AC with common washroom - 3 sharing",
    "Paari: Non-AC with common washroom - 4 & 5 sharing"
  ]
};

document.getElementById("hostelType").addEventListener("change", function () {
  const selectedType = this.value;
  const hostelDropdown = document.getElementById("hostel");

  // Clear existing options
  hostelDropdown.innerHTML = `<option value="">-- Select Hostel --</option>`;

  if (selectedType && hostelData[selectedType]) {
    hostelData[selectedType].forEach(hostel => {
      const option = document.createElement("option");
      option.value = hostel;
      option.textContent = hostel;
      hostelDropdown.appendChild(option);
    });
  }
});
