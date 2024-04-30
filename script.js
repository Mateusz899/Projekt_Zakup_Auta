const carListDiv = document.getElementById("carList");
const carFormDiv = document.getElementById("carForm");
const purchaseForm = document.getElementById("purchaseForm");
const backButton = document.getElementById("backButton");
const errorMessage = document.getElementById("errorMessage");
const confirmationDiv = document.getElementById("confirmation");
const paymentMethodSpan = document.getElementById("paymentMethod");
const totalPriceSpan = document.getElementById("totalPrice");
const confirmationImage = document.getElementById("confirmationImage");
let selectedCarId = null;
let carsData = [];

// Dane samochodów zostały wczytane z pliku cars.json
fetch("./assets/cars.json")
  .then((response) => response.json())
  .then((data) => {
    carsData = data;
    displayCarList();
  });

function displayCarList(cars = carsData) {
  carListDiv.innerHTML = "";

  cars.forEach((car) => {
    const carDiv = document.createElement("div");
    carDiv.classList.add("carItem");
    carDiv.innerHTML = `
              <img src="${car.picture}" alt="${car.brand}">
              <p><strong>Marka:</strong> ${car.brand}</p>
              <p><strong>Model:</strong> ${car.model}</p>
              <p><strong>Rok produkcji:</strong> ${car.manufacture_year}</p>
              <p><strong>Cena:</strong> ${car.price} zł</p>
              <p><strong>Moc silnika:</strong> ${car.engine_power} KM</p>
              <p><strong>Przebieg:</strong> ${car.mileage} KM</p>
              <button class="buyButton" data-id="${car.id}">Kup Teraz</button>
          `;
    carDiv
      .querySelector(".buyButton")
      .addEventListener("click", () => showPurchaseForm(car.id));
    carListDiv.appendChild(carDiv);
  });
}

// Wyszukiwanie aut po marce
const carSearchInput = document.getElementById("carSearchInput");
carSearchInput.addEventListener("input", () => {
  const searchText = carSearchInput.value.trim().toLowerCase();
  const filteredCars = carsData.filter((car) =>
    car.brand.toLowerCase().includes(searchText)
  );
  displayCarList(filteredCars);
});

window.addEventListener("load", () => {
  const savedFormData = JSON.parse(localStorage.getItem("carPurchaseFormData"));
  if (savedFormData) {
    purchaseForm.ownerName.value = savedFormData.ownerName;
    purchaseForm.deliveryDate.value = savedFormData.deliveryDate;
    purchaseForm.accessories.value = savedFormData.accessories;
  }
});

purchaseForm.addEventListener("change", () => {
  const formData = {
    ownerName: purchaseForm.ownerName.value,
    deliveryDate: purchaseForm.deliveryDate.value,
    accessories: purchaseForm.accessories.value,
  };
  localStorage.setItem("carPurchaseFormData", JSON.stringify(formData));
});

// Wyświetlenie formularza zakupu
function showPurchaseForm(carId) {
  selectedCarId = carId;
  carListDiv.style.display = "none";
  carFormDiv.style.display = "block";
  errorMessage.textContent = "";
  populateDeliveryDates();
}

// Wybór daty dostawy - data dostawy to 14 dni od bieżącego dnia
function populateDeliveryDates() {
  const deliveryDateSelect = document.getElementById("deliveryDate");
  deliveryDateSelect.innerHTML = "";

  const currentDate = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    const option = document.createElement("option");
    option.text = date.toLocaleDateString();
    option.value = date.toISOString();
    deliveryDateSelect.add(option);
  }
}
// backButton
backButton.addEventListener("click", () => {
  carListDiv.style.display = "block";
  carFormDiv.style.display = "none";
  purchaseForm.reset();
});

// Formularz zakupu
purchaseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(purchaseForm);
  const financing = formData.get("financing");
  const ownerName = formData.get("ownerName");
  const deliveryDate = formData.get("deliveryDate");
  const accessories = formData.getAll("accessories");

  if (!ownerName.trim().includes(" ")) {
    errorMessage.textContent =
      "Imię i nazwisko powinny być odzielone przynajmniej jedną spacją.";
    return;
  }

  const selectedCar = carsData.find((car) => car.id === selectedCarId);
  const totalPrice = selectedCar.price + calculateAccessoriesPrice(accessories);
  const paymentMethod = financing === "gotówka" ? "Gotówka" : "Leasing";

  confirmationDiv.style.display = "block";
  paymentMethodSpan.textContent = paymentMethod;
  totalPriceSpan.textContent = totalPrice;
  confirmationImage.src = selectedCar.picture;
  purchaseForm.reset();
  selectedCarId = null;
});

// Obliczanie ceny akcesoriów
function calculateAccessoriesPrice(accessories) {
  let totalPrice = 0;
  const accessoriesData = [
    { id: 1, name: "GPS", price: 500 },
    { id: 2, name: "Podgrzewane fotele", price: 1000 },
    { id: 3, name: "Kamera cofania", price: 800 },
  ];

  accessories.forEach((accessoryId) => {
    const accessory = accessoriesData.find(
      (item) => item.id.toString() === accessoryId
    );
    if (accessory) {
      totalPrice += accessory.price;
    }
  });

  return totalPrice;
}

displayCarList();
