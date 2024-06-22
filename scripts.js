document.addEventListener("DOMContentLoaded", function () {
  const bookIndividualBtn = document.getElementById("book-individual");
  const bookTeamBtn = document.getElementById("book-team");
  const deskSelection = document.getElementById("desk-selection");
  const individualDesks = document.getElementById("individual-desks");
  const teamDesks = document.getElementById("team-desks");
  const bookingForm = document.getElementById("booking-form");
  const deskIdInput = document.getElementById("desk-id");
  const startTimeInput = document.getElementById("start-time");
  const endTimeInput = document.getElementById("end-time");
  const membershipTierInput = document.getElementById("membership-tier");
  const bookedDesksDiv = document.getElementById("booked-desks");
  const revenueReportDiv = document.getElementById("revenue-report");

  const desks = {
    individual: Array.from({ length: 10 }, (_, i) => ({
      id: `I-${i + 1}`,
      booked: [],
    })),
    team: Array.from({ length: 5 }, (_, i) => ({
      id: `T-${i + 1}`,
      booked: [],
    })),
  };

  const rates = {
    basic: 15000,
    premium: 22500,
    executive: 30000,
    team: 37500,
  };

  bookIndividualBtn.addEventListener("click", () => {
    showDesks("individual");
  });

  bookTeamBtn.addEventListener("click", () => {
    showDesks("team");
  });

  function showDesks(type) {
    deskSelection.classList.remove("hidden");
    if (type === "individual") {
      individualDesks.classList.remove("hidden");
      teamDesks.classList.add("hidden");
      renderDesks(desks.individual, "individual-desks");
    } else {
      teamDesks.classList.remove("hidden");
      individualDesks.classList.add("hidden");
      renderDesks(desks.team, "team-desks");
    }
  }

  function renderDesks(deskArray, containerId) {
    const container = document
      .getElementById(containerId)
      .querySelector(".desks");
    container.innerHTML = "";
    deskArray.forEach((desk) => {
      const deskDiv = document.createElement("div");
      deskDiv.classList.add("desk");
      deskDiv.dataset.id = desk.id;
      deskDiv.innerText = desk.id;
      if (desk.booked.length > 0) deskDiv.classList.add("booked");
      deskDiv.addEventListener("click", () => {
        if (!deskDiv.classList.contains("booked")) {
          selectDesk(desk.id);
        }
      });
      container.appendChild(deskDiv);
    });
  }

  function selectDesk(deskId) {
    deskIdInput.value = deskId;
    bookingForm.classList.remove("hidden");
  }

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const deskId = deskIdInput.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const membershipTier = membershipTierInput.value;

    if (!isValidTimeRange(startTime, endTime)) {
      showNotification("Invalid time range", "error");
      return;
    }

    const deskType = deskId.startsWith("I") ? "individual" : "team";
    const desk = desks[deskType].find((d) => d.id === deskId);

    if (isDoubleBooking(desk, startTime, endTime)) {
      showNotification("Desk already booked for this time range", "error");
      return;
    }

    desk.booked.push({ startTime, endTime, membershipTier });
    renderDesks(
      deskType === "individual" ? desks.individual : desks.team,
      `${deskType}-desks`
    );
    updateDashboard();
    showNotification("Booking successful", "success");
    bookingForm.reset();
    bookingForm.classList.add("hidden");
  });

  function isValidTimeRange(startTime, endTime) {
    return startTime < endTime;
  }

  function isDoubleBooking(desk, startTime, endTime) {
    return desk.booked.some((b) => {
      return startTime < b.endTime && endTime > b.startTime;
    });
  }

  function updateDashboard() {
    bookedDesksDiv.innerHTML = "";
    Object.keys(desks).forEach((type) => {
      desks[type].forEach((desk) => {
        desk.booked.forEach((booking) => {
          const bookingDiv = document.createElement("div");
          bookingDiv.innerText = `${desk.id}: ${booking.startTime} - ${booking.endTime} (${booking.membershipTier})`;
          bookedDesksDiv.appendChild(bookingDiv);
        });
      });
    });

    const revenue = calculateRevenue();
    revenueReportDiv.innerHTML = `Total Revenue: ${revenue.total} Naira<br>`;
    revenueReportDiv.innerHTML += `Basic: ${revenue.basic} Naira, Premium: ${revenue.premium} Naira, Executive: ${revenue.executive} Naira, Team: ${revenue.team} Naira`;
  }

  function calculateRevenue() {
    const revenue = {
      total: 0,
      basic: 0,
      premium: 0,
      executive: 0,
      team: 0,
    };
    Object.keys(desks).forEach((type) => {
      desks[type].forEach((desk) => {
        desk.booked.forEach((booking) => {
          const rate =
            type === "individual" ? rates[booking.membershipTier] : rates.team;
          const hours =
            (new Date(`1970-01-01T${booking.endTime}Z`) -
              new Date(`1970-01-01T${booking.startTime}Z`)) /
            3600000;
          let amount = rate * hours;
          if (hours > 3) amount *= 0.9; // Apply 10% discount
          revenue[booking.membershipTier] += amount;
          revenue.total += amount;
        });
      });
    });
    return revenue;
  }

  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
});
