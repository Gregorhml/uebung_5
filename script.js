document.addEventListener("DOMContentLoaded", function () {
  initPageSwitch();
  initSignInForm();
  initDatabase();
});

function initPageSwitch() {
  var switchIndex = document.querySelector("#switchIndex");
  var switchDatabase = document.querySelector("#switchDatabase");

  if (!switchIndex || !switchDatabase) {
    return;
  }

  var path = window.location.pathname;
  var isDatabase = false;
  if (path && path.indexOf("database.html") !== -1) {
    isDatabase = true;
  }

  if (isDatabase) {
    switchIndex.classList.remove("active");
    switchDatabase.classList.add("active");
  } else {
    switchIndex.classList.add("active");
    switchDatabase.classList.remove("active");
  }
}

function initSignInForm() {
  var formElement = document.querySelector("#nameForm");
  var submitBtn = document.querySelector("#submitBtn");

  if (!formElement || !submitBtn) {
    return;
  }

  submitBtn.addEventListener("click", function (event) {
    event.preventDefault();

    if (!validateAllFields()) {
      formElement.reportValidity();
      return;
    }

    var formData = new FormData(formElement);
    var formDataObj = {};

    var iterator = formData.entries();
    for (var step = iterator.next(); !step.done; step = iterator.next()) {
      var pair = step.value;
      var key = pair[0];
      var value = pair[1];
      formDataObj[key] = value;
    }

    var storageKey = "db_entry_" + Date.now();
    localStorage.setItem(storageKey, JSON.stringify(formDataObj));
  });
}

function validateAllFields() {
  var form = document.querySelector("#nameForm");

  var inputs = [];
  var firstnameInput = document.querySelector("#firstnameInput");
  if (firstnameInput) {
    inputs.push(firstnameInput);
  }

  var lastnameInput = document.querySelector("#lastnameInput");
  if (lastnameInput) {
    inputs.push(lastnameInput);
  }

  var emailInput = document.querySelector("#emailInput");
  if (emailInput) {
    inputs.push(emailInput);
  }

  var gradeInput = document.querySelector("#gradeInput");
  if (gradeInput) {
    inputs.push(gradeInput);
  }

  var gradeAverageInput = document.querySelector("#gradeAverageInput");
  if (gradeAverageInput) {
    inputs.push(gradeAverageInput);
  }

  if (inputs.length === 0) {
    return true;
  }

  if (!form) {
    return true;
  }

  return form.checkValidity();
}

function initDatabase() {
  var databaseList = document.querySelector("#databaseList");
  if (!databaseList) {
    return;
  }

  renderDatabaseEntries(databaseList);
}

function renderDatabaseEntries(container) {
  container.innerHTML = "";

  var entries = readDatabaseEntries();

  if (entries.length === 0) {
    var empty = document.createElement("p");
    empty.textContent = "Keine Einträge gefunden.";
    empty.style.color = "white";
    container.appendChild(empty);
    return;
  }

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var d = entry.data;

    var card = document.createElement("div");
    card.className = "dbCard";

    var firstName = "";
    if (d && d.firstname) {
      firstName = d.firstname;
    }

    var lastName = "";
    if (d && d.lastname) {
      lastName = d.lastname;
    }

    var emailValue = "";
    if (d && d.email) {
      emailValue = d.email;
    }

    var gradeValue = "";
    if (d && d.grade) {
      gradeValue = d.grade;
    }

    var avgValue = "";
    if (d && d.gradeAverage) {
      avgValue = d.gradeAverage;
    }

    card.innerHTML =
      '<div class="dbName">' + escapeHtml(firstName) + " " + escapeHtml(lastName) + "</div>" +
      '<div class="dbFieldGroup">' +
      '<label class="dbLabel dbEmailLabel">E-Mail</label>' +
      '<input class="dbInput dbEmailInput" type="text" value="' + escapeHtml(emailValue) + '" disabled />' +
      "</div>" +
      '<div class="dbFieldGroup">' +
      '<label class="dbLabel dbGradeLabel">Klasse</label>' +
      '<input class="dbInput dbGradeInput" type="text" value="' + escapeHtml(gradeValue) + '" disabled />' +
      "</div>" +
      '<div class="dbFieldGroup">' +
      '<label class="dbLabel dbGradeAverageLabel">Notendurchschnitt</label>' +
      '<input class="dbInput dbGradeAverageInput" type="text" value="' + escapeHtml(avgValue) + '" disabled />' +
      "</div>" +
      '<button class="dbDeleteBtn" type="button" data-key="' + escapeHtml(entry.key) + '">Löschen</button>';

    container.appendChild(card);

    var deleteBtn = card.querySelector(".dbDeleteBtn");
    // let, damit der richtige Key beim Klick gespeichert ist
    let deleteKey = entry.key;
    deleteBtn.addEventListener("click", function () {
      localStorage.removeItem(deleteKey);
      renderDatabaseEntries(container);
    });
  }
}

function readDatabaseEntries() {
  var results = [];

  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    var raw = localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      var data = JSON.parse(raw);
      if (
        data &&
        typeof data === "object" &&
        "firstname" in data &&
        "lastname" in data &&
        "email" in data &&
        "grade" in data &&
        "gradeAverage" in data
      ) {
        results.push({ key: key, data: data });
      }
    } catch (err) {
    }
  }

  results.sort(function (a, b) {
    return extractSortId(b.key) - extractSortId(a.key);
  });

  return results;
}

function extractSortId(key) {
  var matches = key.match(/\d+/g);

  if (!matches || matches.length === 0) {
    var n = Number(key);
    if (isFinite(n)) {
      return n;
    }
    return 0;
  }

  var last = Number(matches[matches.length - 1]);
  if (isFinite(last)) {
    return last;
  }
  return 0;
}

function escapeHtml(str) {
  var text = String(str);
  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");
  text = text.replace(/"/g, "&quot;");
  text = text.replace(/'/g, "&#039;");
  return text;
}