"use strict";

const galleryAdminConfig = {
  dataPath: "assets/data/gallery.json",
  imageFolder: "assets/images/gallery",
  maxImageSide: 1800,
  imageQuality: 0.86,
};

const adminForm = document.querySelector("[data-admin-gallery-form]");
const adminImageInput = adminForm ? adminForm.querySelector('input[name="image"]') : null;

const setAdminStatus = (message, type = "info") => {
  const status = document.querySelector("[data-admin-status]");
  if (!status) return;
  if (!message) {
    status.textContent = "";
    status.classList.remove("is-visible");
    delete status.dataset.status;
    return;
  }

  status.textContent = message;
  status.classList.add("is-visible");
  status.dataset.status = type;
};

const cleanSegment = (value) => encodeURIComponent(value).replace(/%2F/g, "/");

const slugify = (value) =>
  String(value || "gallery-photo")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "gallery-photo";

const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });

const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("The selected image could not be read.")));
    image.src = source;
  });

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result).split(",")[1]));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(blob);
  });

const textToBase64 = (text) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    const chunk = bytes.subarray(index, index + 0x8000);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const base64ToText = (content) => {
  const binary = atob(String(content || "").replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const detectLayout = (width, height) => {
  if (height > width * 1.25) return "tall";
  if (width > height * 1.8) return "panorama";
  if (width > height * 1.25) return "wide";
  return "";
};

async function prepareImage(file) {
  const source = await readAsDataURL(file);
  const image = await loadImage(source);
  const largestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = Math.min(1, galleryAdminConfig.maxImageSide / largestSide);
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", galleryAdminConfig.imageQuality);
  });

  if (!blob) throw new Error("The browser could not prepare the image for upload.");

  return {
    content: await blobToBase64(blob),
    extension: "jpg",
    layout: detectLayout(width, height),
    width,
    height,
  };
}

async function githubRequest({ owner, repo, path, branch, token, method = "GET", body }) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${cleanSegment(path)}${
    method === "GET" ? `?ref=${encodeURIComponent(branch)}` : ""
  }`;

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2026-03-10",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 404 && method === "GET") return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `GitHub request failed with status ${response.status}.`);
  }

  return payload;
}

async function readGalleryData(settings) {
  const file = await githubRequest({ ...settings, path: galleryAdminConfig.dataPath });
  if (!file) return { data: { items: [] }, sha: undefined };

  const parsed = JSON.parse(base64ToText(file.content));
  if (!Array.isArray(parsed.items)) parsed.items = [];
  return { data: parsed, sha: file.sha };
}

async function writeFile(settings, path, content, message, sha) {
  return githubRequest({
    ...settings,
    method: "PUT",
    path,
    body: {
      message,
      content,
      branch: settings.branch,
      sha,
    },
  });
}

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date);
};

function initAdminPreview() {
  if (!adminForm) return;

  const preview = document.querySelector("[data-admin-preview]");
  const previewImage = preview ? preview.querySelector("img") : null;
  const previewTitle = document.querySelector("[data-preview-title]");
  const previewMeta = document.querySelector("[data-preview-meta]");

  const updatePreviewText = () => {
    if (!preview || !previewTitle || !previewMeta) return;
    const data = new FormData(adminForm);
    previewTitle.textContent = data.get("title") || "Selected gallery photo";
    previewMeta.textContent = [data.get("eventTitle"), formatDate(data.get("eventDate")), data.get("location")]
      .filter(Boolean)
      .join(" | ");
  };

  adminForm.addEventListener("input", updatePreviewText);
  if (!adminImageInput) return;

  adminImageInput.addEventListener("change", async () => {
    const file = adminImageInput.files[0];
    if (!file || !preview || !previewImage) return;
    previewImage.src = await readAsDataURL(file);
    preview.hidden = false;
    updatePreviewText();
  });

  adminForm.addEventListener("reset", () => {
    window.setTimeout(() => {
      if (preview) preview.hidden = true;
      setAdminStatus("", "info");
    }, 0);
  });
}

async function handleAdminSubmit(event) {
  event.preventDefault();
  if (!adminForm.reportValidity()) return;

  const submitButton = document.querySelector("[data-admin-submit]");
  const formData = new FormData(adminForm);
  const token = String(formData.get("token") || "").trim();
  const owner = String(formData.get("owner") || "").trim();
  const repo = String(formData.get("repo") || "").trim();
  const branch = String(formData.get("branch") || "main").trim();
  const imageFile = adminImageInput ? adminImageInput.files[0] : null;

  if (!imageFile) {
    setAdminStatus("Please choose a photo before publishing.", "error");
    return;
  }

  const settings = { owner, repo, branch, token };
  const eventTitle = String(formData.get("eventTitle") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const dateValue = String(formData.get("eventDate") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const description = String(formData.get("description") || "").trim();

  try {
    if (submitButton) submitButton.disabled = true;
    setAdminStatus("Preparing image for web upload...", "info");

    const preparedImage = await prepareImage(imageFile);
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    const imagePath = `${galleryAdminConfig.imageFolder}/${timestamp}-${slugify(title || eventTitle)}.${preparedImage.extension}`;

    setAdminStatus("Uploading image to GitHub...", "info");
    await writeFile(settings, imagePath, preparedImage.content, `Add gallery image: ${title || eventTitle}`);

    setAdminStatus("Updating gallery data...", "info");
    const { data, sha } = await readGalleryData(settings);
    const item = {
      id: `${timestamp}-${slugify(title || eventTitle)}`,
      eventTitle,
      title,
      eventDate: dateValue ? formatDate(dateValue) : "",
      location,
      category,
      description,
      image: imagePath,
      alt: `${title} - ${eventTitle}`,
      layout: preparedImage.layout,
      uploadedAt: new Date().toISOString(),
    };

    data.items.unshift(item);

    await writeFile(
      settings,
      galleryAdminConfig.dataPath,
      textToBase64(`${JSON.stringify(data, null, 2)}\n`),
      `Publish gallery item: ${title || eventTitle}`,
      sha,
    );

    setAdminStatus("Published successfully. GitHub Pages may take a minute or two to show the new item.", "success");
  } catch (error) {
    setAdminStatus(error.message || "Upload failed. Please check the token and repository permission.", "error");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

if (adminForm) {
  initAdminPreview();
  adminForm.addEventListener("submit", handleAdminSubmit);
}
