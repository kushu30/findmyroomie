const hostelData = {
  girls: [
    "Kopperundevi: AC with attached washroom - 2 sharing",
    "Kopperundevi: Non-AC with attached washroom - 2 sharing",
    "ESQ A: Non-AC with attached washroom - 2 sharing",
    "ESQ A: Non-AC with attached washroom - 3 sharing",
    "ESQ A: Non-AC with attached washroom - 4 sharing",
    "ESQ B: Non-AC with attached washroom - 2 sharing",
    "ESQ B: Non-AC with attached washroom - 3 sharing",
    "Sannasi C: AC with attached washroom - 3 sharing",
    "Sannasi C: Non-AC with attached washroom - 3 sharing",
    "Malligai: Non-AC with common washroom - 2 sharing",
    "Senbagam: Non-AC with common washroom - 3 sharing",
    "Senbagam: Non-AC with common washroom - 6 sharing"
  ],
  boys: [
    "Premium Boys: AC with attached washroom - 3 sharing",
    "Green Pearl (Off-Campus): AC with attached washroom - 3 sharing",
    "Green Pearl (Off-Campus): Non-AC with attached washroom - 3 sharing",
    "Nelson Mandela: AC with attached washroom - 3 sharing",
    "Agasthiyar: AC with attached washroom - 4 sharing",
    "Sannasi A: AC with attached washroom - 3 sharing",
    "Sannasi A: Non-AC with attached washroom - 3 sharing",
    "Began: AC with common washroom - 3 sharing",
    "Oori: AC with common washroom - 4 & 5 sharing",
    "Manoranjitham: Non-AC with common washroom - 3 sharing",
    "Kaari: Non-AC with common washroom - 4 & 5 sharing",
    "Paari: Non-AC with common washroom - 4 & 5 sharing"
  ]
};

document.getElementById("hostelType").addEventListener("change", function () {
  const selectedType = this.value;
  const hostelDropdown = document.getElementById("hostel");

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
