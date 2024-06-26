import { API_BASE_URL, NOROFF_USER_INFO, DEFAULT_NAME } from "./constants.js";
import { renderHeader } from "./header.js";
import { renderFooter } from "./footer.js";

window.store = {};

function init() {
  renderHeader();
  renderFooter();
}

init();

export function stringifyValue(value) {
  return JSON.stringify(value);
}

export function parseString(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function setValueToStore(key, value) {
  return new Promise((resolve) => {
    store[key] = value;
    localStorage.setItem(
      key,
      typeof value === "object" ? stringifyValue(value) : value
    );
    resolve(value);
  });
}

export async function deleteValueFromStore(key) {
  return new Promise((resolve) => {
    delete store[key];
    localStorage.removeItem(key);
    resolve(true);
  });
}

export function getValueFromStore(key) {
  return store[key] || parseString(localStorage.getItem(key));
}

export function getValuesUniqued(values) {
  var valuesUniqued = [];
  values.forEach((item) => {
    if (!valuesUniqued.includes(item)) {
      valuesUniqued.push(item);
    }
  });

  return valuesUniqued;
}

export function fetchAPI(url, method, options = {}) {
  renderLoading(true);
  const baseURL = options.baseURL || API_BASE_URL;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const accessToken = getValueFromStore(NOROFF_USER_INFO)?.accessToken;
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return fetch(`${baseURL}${url}`, {
    method: method,
    headers: headers,
    body: options.body,
    data: options.data,
  })
    .then(async (response) => {
      
      if (!response.ok) {
        
        return response.json().then((errorData) => {
         
          const error = new Error("Network response was not ok");
          error.data = errorData; 
          throw error; 
        });
      }

      try {
        const data = await response.json();
        return data;
      } catch {
        return {};
      }
    })
    .finally(() => {
      renderLoading(false);
    });
}

export function removeElementsByClass(className) {
  const elements = document.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

export function showMessage(message, type = "success") {
  removeElementsByClass("core-message");

  const formElm = document.querySelector("body");
  const coreMessageElm = document.createElement("div");
  coreMessageElm.innerHTML = message;
  coreMessageElm.style.display = "block";
  coreMessageElm.classList.add("core-message", `core-message-${type}`);

  formElm.appendChild(coreMessageElm);
  setTimeout(() => {
    coreMessageElm.remove();
  }, 5000);
}

export function hideMessage() {
  const formElm = document.querySelector("form");
  const coreMessageElm = document.createElement("div");
  coreMessageElm.style.display = "none";
  coreMessageElm.className = "core-message";

  formElm.appendChild(coreMessageElm);
}

export function getUserInfo() {
  return getValueFromStore(NOROFF_USER_INFO) || { name: DEFAULT_NAME };
}

export function logout() {
  deleteValueFromStore(NOROFF_USER_INFO);
  navigate("/");
}

export function navigate(url) {
  window.location.href = url;
}

export function showModal(content) {
  const bodyElm = document.querySelector("body");
  const coreModalElm = document.createElement("div");
  coreModalElm.innerHTML = `
    <div id="core-modal" class="modal">
      <div class="modal-content">
        ${content}
      </div>
    </div>
  `;

  bodyElm.appendChild(coreModalElm);

  return coreModalElm;
}

export function hideModal() {
  const coreModalElm = document.getElementById("core-modal");
  coreModalElm.remove();
}

export function renderLoading(isLoading) {
  var bodySelector = document.querySelector("body");
  if (isLoading) {
    var temp = document.createElement("div");
    temp.className = "spinner-container";
    temp.innerHTML = `<div class="spinner"></div>`;
    bodySelector.appendChild(temp);
  } else {
    const existed = document.querySelector(".spinner-container");
    if (existed) {
      existed.remove();
    }
  }
}

export function fullURL() {
  return window.location.href;
}

export function getParam(name) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const value = urlParams.get(name);
  return value;
}

export function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      
      showMessage("Text copied to clipboard: " + text);
    })
    .catch((err) => {
      
      showMessage(
        "Unable to copy text to clipboard. Please try again.",
        "error"
      );
    });
}

export function handleTag(tags) {
  return tags.split(",").map((item) => item.toLowerCase().trim());
}

export function sortBy(data, propertyName, reverse = false) {
  const filteredData = [...data].sort((a, b) =>
    reverse
      ? b[propertyName].localeCompare(a[propertyName])
      : a[propertyName].localeCompare(b[propertyName])
  );

  return filteredData;
}

export function sortByDateTime(data, propertyName, reverse = false) {
  const filteredData = [...data].sort((a, b) =>
    reverse
      ? new Date(b[propertyName]) - new Date(a[propertyName])
      : new Date(a[propertyName]) - new Date(b[propertyName])
  );

  return filteredData;
}

export function debounce(func, delay) {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}
