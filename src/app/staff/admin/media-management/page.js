"use client";

import { useEffect, useState } from "react";

import {
  Newspaper,
  Images,
  Plus,
  ArrowRight,
  X,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import StaffSidebar from "@/components/staff/StaffSidebar";

export default function MediaManagementPage() {
  const [activeSection, setActiveSection] = useState("news");

  // ============================================================
  // MEDIA DATA
  // ============================================================

  const [newsArticles, setNewsArticles] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);

  // ============================================================
  // MODAL STATE
  // ============================================================

  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [showConsentConfirmation, setShowConsentConfirmation] =
  useState(false);

const [showNewsConsentConfirmation, setShowNewsConsentConfirmation] =
  useState(false);

  const [viewItem, setViewItem] = useState(null);
  const [viewType, setViewType] = useState(null);

  // ============================================================
  // EDIT STATE
  // ============================================================

  const [editingNews, setEditingNews] = useState(null);
  const [editingGallery, setEditingGallery] = useState(null);

  // ============================================================
  // STATUS
  // ============================================================

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form-specific errors
  const [newsFormError, setNewsFormError] = useState("");
  const [galleryFormError, setGalleryFormError] = useState("");

    // ============================================================
  // FILTERS
  // ===============================================================
  const [newsFilter, setNewsFilter] = useState("all");
const [galleryFilter, setGalleryFilter] = useState("all");
  // ============================================================
  // NEWS FORM
  // ============================================================

  const [newsForm, setNewsForm] = useState({
    title: "",
    slug: "",
    category: "News",
    excerpt: "",
    content: "",
    featured_image_url: "",
    image_contains_learners: false,
    consent_confirmed: false,
    published: false,
  });

  const [newsImageFile, setNewsImageFile] = useState(null);
  const [newsImagePreview, setNewsImagePreview] = useState("");

  // ============================================================
  // GALLERY FORM
  // ============================================================

  const [galleryForm, setGalleryForm] = useState({
    image_url: "",
    title: "",
    caption: "",
    alt_text: "",
    category: "School Events",
    photo_type: "general",
    consent_confirmed: false,
    published: false,
  });

  const [galleryImageFile, setGalleryImageFile] = useState(null);
  const [galleryImagePreview, setGalleryImagePreview] = useState("");

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadNews();
        loadGallery();
      } else {
        setErrorMessage(
          "You must be logged in to access Media Management."
        );

        setLoadingNews(false);
        setLoadingGallery(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ============================================================
  // GET FIREBASE AUTH TOKEN
  // ============================================================

  const getAuthToken = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("You must be logged in.");
    }

    return await currentUser.getIdToken();
  };

  // ============================================================
  // LOAD NEWS
  // ============================================================

  const loadNews = async () => {
    try {
      setLoadingNews(true);

      const token = await getAuthToken();

      const response = await fetch("/api/staff/admin/news", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load news.");
      }

      setNewsArticles(
        Array.isArray(data) ? data : data.news || []
      );
    } catch (error) {
      console.error("Load news error:", error);

      setErrorMessage(
        error.message || "Failed to load news."
      );
    } finally {
      setLoadingNews(false);
    }
  };

  // ============================================================
  // LOAD GALLERY
  // ============================================================

  const loadGallery = async () => {
    try {
      setLoadingGallery(true);

      const token = await getAuthToken();

      const response = await fetch("/api/staff/admin/gallery", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load gallery.");
      }

      setGalleryImages(
        Array.isArray(data) ? data : data.gallery || []
      );
    } catch (error) {
      console.error("Load gallery error:", error);

      setErrorMessage(
        error.message || "Failed to load gallery."
      );
    } finally {
      setLoadingGallery(false);
    }
  };

  // ============================================================
  // SLUG GENERATOR
  // ============================================================

  function generateSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // ============================================================
  // NEWS FORM CHANGE
  // ============================================================

  function handleNewsFormChange(event) {
    const { name, value, type, checked } = event.target;

    setNewsFormError("");

    setNewsForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // ============================================================
  // GALLERY FORM CHANGE
  // ============================================================

function handleGalleryFormChange(event) {
  const { name, value, type, checked } = event.target;

  setGalleryFormError("");

  setGalleryForm((previous) => {
    const newValue =
      type === "checkbox" ? checked : value;

    if (name === "photo_type" && value === "general") {
      return {
        ...previous,
        photo_type: "general",
        consent_confirmed: false,
      };
    }

    return {
      ...previous,
      [name]: newValue,
    };
  });
}

  // ============================================================
  // NEWS TITLE CHANGE
  // ============================================================

  function handleNewsTitleChange(event) {
    const title = event.target.value;

    setNewsFormError("");

    setNewsForm((previous) => ({
      ...previous,
      title,

      // Automatically generate slug only for new articles.
      slug: editingNews
        ? previous.slug
        : generateSlug(title),
    }));
  }

  // ============================================================
  // NEWS IMAGE SELECTION
  // ============================================================

  const handleNewsImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNewsFormError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setNewsFormError(
        "The image must be smaller than 10 MB."
      );
      event.target.value = "";
      return;
    }

    setNewsFormError("");
    setNewsImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setNewsImagePreview(previewUrl);

    // A new image may have different learner content.
    setNewsForm((previous) => ({
      ...previous,
      featured_image_url: "",
      image_contains_learners: false,
      consent_confirmed: false,
    }));
  };

  // ============================================================
  // GALLERY IMAGE SELECTION
  // ============================================================

  const handleGalleryImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setGalleryFormError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setGalleryFormError(
        "The image must be smaller than 10 MB."
      );
      event.target.value = "";
      return;
    }

    setGalleryFormError("");
    setGalleryImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setGalleryImagePreview(previewUrl);
  };

  // ============================================================
  // UPLOAD NEWS IMAGE
  // ============================================================

  const uploadNewsImage = async () => {
    if (!newsImageFile) {
      return newsForm.featured_image_url || "";
    }

    const token = await getAuthToken();

    const formData = new FormData();

    formData.append("file", newsImageFile);

    const response = await fetch(
      "/api/staff/admin/news/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to upload the news image."
      );
    }

    return data.file_url;
  };

  // ============================================================
  // UPLOAD GALLERY IMAGE
  // ============================================================

  const uploadGalleryImage = async () => {
    if (!galleryImageFile) {
      return galleryForm.image_url || "";
    }

    const token = await getAuthToken();

    const formData = new FormData();

    formData.append("file", galleryImageFile);

    const response = await fetch(
      "/api/staff/admin/gallery/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to upload the gallery image."
      );
    }

    return data.image_url || data.file_url;
  };

// ============================================================
// CREATE / UPDATE NEWS
// ============================================================

const handleCreateArticle = async (event) => {
  event.preventDefault();

  setMessage("");
  setErrorMessage("");
  setNewsFormError("");

  if (!newsForm.title.trim()) {
    setNewsFormError("Please enter a title.");
    return;
  }

  if (!newsForm.slug.trim()) {
    setNewsFormError("Please enter a slug.");
    return;
  }

  if (!newsForm.content.trim()) {
    setNewsFormError("Please enter the article content.");
    return;
  }

  const hasImage =
    Boolean(newsImageFile) ||
    Boolean(newsForm.featured_image_url);

  if (newsForm.image_contains_learners && !hasImage) {
    setNewsFormError(
      "Please select a featured image before marking it as containing learners."
    );
    return;
  }

  // Published learner images require consent confirmation.
  // The modal will handle the confirmation.
  if (
    newsForm.published &&
    newsForm.image_contains_learners &&
    !newsForm.consent_confirmed
  ) {
    setShowNewsConsentConfirmation(true);
    return;
  }

  await submitNewsArticle();
};


// ============================================================
// SUBMIT NEWS ARTICLE
// ============================================================

const submitNewsArticle = async (
  consentOverride = newsForm.consent_confirmed
) => {
  try {
    setSubmitting(true);
    setNewsFormError("");

    const imageUrl = await uploadNewsImage();

    const containsLearners =
      Boolean(imageUrl) &&
      newsForm.image_contains_learners;

    const finalConsent = containsLearners
      ? consentOverride
      : false;

    const token = await getAuthToken();

    const url = editingNews
      ? `/api/staff/admin/news/${encodeURIComponent(
          editingNews.slug
        )}`
      : "/api/staff/admin/news";

    const response = await fetch(url, {
      method: editingNews ? "PUT" : "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        title: newsForm.title,
        slug: newsForm.slug,
        category: newsForm.category,
        excerpt: newsForm.excerpt,
        content: newsForm.content,

        // Featured image is optional.
        featured_image_url: imageUrl || null,

        image_contains_learners: containsLearners,

        consent_confirmed: finalConsent,

        published: newsForm.published,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          (editingNews
            ? "Failed to update article."
            : "Failed to create article.")
      );
    }

    setMessage(
      editingNews
        ? "Article updated successfully."
        : "Article created successfully."
    );

    closeNewsForm();

    await loadNews();
  } catch (error) {
    console.error("News save error:", error);

    setNewsFormError(
      error.message || "Failed to save article."
    );
  } finally {
    setSubmitting(false);
  }
};

// ============================================================
// CREATE / UPDATE GALLERY PHOTO
// ============================================================

const handleUploadPhoto = async (event) => {
  event.preventDefault();

  setMessage("");
  setErrorMessage("");
  setGalleryFormError("");

  if (!galleryImageFile && !galleryForm.image_url) {
    setGalleryFormError("Please select an image.");
    return;
  }

  if (!galleryForm.alt_text.trim()) {
    setGalleryFormError(
      "Please enter alt text for the image."
    );
    return;
  }

  // Published learner photos require consent confirmation.
  if (
    galleryForm.photo_type === "learners" &&
    galleryForm.published &&
    !galleryForm.consent_confirmed
  ) {
    setShowConsentConfirmation(true);
    return;
  }

  await submitGalleryPhoto(galleryForm.consent_confirmed);
};

  // ============================================================
  // SUBMIT GALLERY PHOTO
  // ============================================================

  const submitGalleryPhoto = async (consentConfirmed) => {
    try {
      setSubmitting(true);
      setGalleryFormError("");

      const finalConsent =
        galleryForm.photo_type === "learners"
          ? consentConfirmed ||
            galleryForm.consent_confirmed
          : false;

      if (
        galleryForm.photo_type === "learners" &&
        galleryForm.published &&
        !finalConsent
      ) {
        setGalleryFormError(
          "Parent/guardian consent must be confirmed before publishing a learner photo."
        );

        setSubmitting(false);
        return;
      }

      const imageUrl = await uploadGalleryImage();

      if (!imageUrl) {
        throw new Error("Please select an image.");
      }

      const token = await getAuthToken();

      const url = editingGallery
        ? `/api/staff/admin/gallery/${editingGallery.id}`
        : "/api/staff/admin/gallery";

      const response = await fetch(url, {
        method: editingGallery ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          image_url: imageUrl,
          title: galleryForm.title,
          caption: galleryForm.caption,
          alt_text: galleryForm.alt_text,
          category: galleryForm.category,
          photo_type: galleryForm.photo_type,
          consent_confirmed: finalConsent,
          published: galleryForm.published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (editingGallery
              ? "Failed to update photo."
              : "Failed to upload photo.")
        );
      }

      setMessage(
        editingGallery
          ? "Photo updated successfully."
          : "Photo uploaded successfully."
      );

      closeGalleryForm();

      await loadGallery();
    } catch (error) {
      console.error("Gallery save error:", error);

      setGalleryFormError(
        error.message || "Failed to save photo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // EDIT NEWS
  // ============================================================

  const openEditNews = (article) => {
    setMessage("");
    setErrorMessage("");
    setNewsFormError("");

    setEditingNews(article);

    setNewsForm({
      title: article.title || "",
      slug: article.slug || "",
      category: article.category || "News",
      excerpt: article.excerpt || "",
      content: article.content || "",
      featured_image_url:
        article.featured_image_url || "",
      image_contains_learners: Boolean(
        article.image_contains_learners
      ),
      consent_confirmed: Boolean(
        article.consent_confirmed
      ),
      published: Boolean(article.published),
    });

    setNewsImageFile(null);
    setNewsImagePreview(
      article.featured_image_url || ""
    );

    setShowNewsForm(true);
  };

  // ============================================================
  // EDIT GALLERY
  // ============================================================

  const openEditGallery = (image) => {
    setMessage("");
    setErrorMessage("");
    setGalleryFormError("");

    setEditingGallery(image);

    setGalleryForm({
      image_url: image.image_url || "",
      title: image.title || "",
      caption: image.caption || "",
      alt_text: image.alt_text || "",
      category: image.category || "School Events",
      photo_type: image.photo_type || "general",
      consent_confirmed: Boolean(
        image.consent_confirmed
      ),
      published: Boolean(image.published),
    });

    setGalleryImageFile(null);
    setGalleryImagePreview(
      image.image_url || ""
    );

    setShowGalleryForm(true);
  };

  // ============================================================
  // VIEW NEWS
  // ============================================================

  const openViewNews = (article) => {
    setViewItem(article);
    setViewType("news");
    setShowViewModal(true);
  };

  // ============================================================
  // VIEW GALLERY
  // ============================================================

  const openViewGallery = (image) => {
    setViewItem(image);
    setViewType("gallery");
    setShowViewModal(true);
  };

  // ============================================================
  // DELETE NEWS
  // ============================================================

  const handleDeleteNews = async (article) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${article.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(article.id);
      setMessage("");
      setErrorMessage("");

      const token = await getAuthToken();

      const response = await fetch(
        `/api/staff/admin/news/${encodeURIComponent(
          article.slug
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete article."
        );
      }

      setMessage("Article deleted successfully.");

      await loadNews();
    } catch (error) {
      console.error("Delete news error:", error);

      setErrorMessage(
        error.message || "Failed to delete article."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // DELETE GALLERY
  // ============================================================

  const handleDeleteGallery = async (image) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this photo?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(image.id);
      setMessage("");
      setErrorMessage("");

      const token = await getAuthToken();

      const response = await fetch(
        `/api/staff/admin/gallery/${image.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete photo."
        );
      }

      setMessage("Photo deleted successfully.");

      await loadGallery();
    } catch (error) {
      console.error("Delete gallery error:", error);

      setErrorMessage(
        error.message || "Failed to delete photo."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // CLOSE NEWS FORM
  // ============================================================

  function closeNewsForm() {
    setShowNewsForm(false);
    setEditingNews(null);
    setNewsFormError("");

    setNewsImageFile(null);
    setNewsImagePreview("");

    setNewsForm({
      title: "",
      slug: "",
      category: "News",
      excerpt: "",
      content: "",
      featured_image_url: "",
      image_contains_learners: false,
      consent_confirmed: false,
      published: false,
    });
  }

  // ============================================================
  // CLOSE GALLERY FORM
  // ============================================================

  function closeGalleryForm() {
    setShowGalleryForm(false);
    setEditingGallery(null);
    setShowConsentConfirmation(false);
    setGalleryFormError("");

    setGalleryImageFile(null);
    setGalleryImagePreview("");

    setGalleryForm({
      image_url: "",
      title: "",
      caption: "",
      alt_text: "",
      category: "School Events",
      photo_type: "general",
      consent_confirmed: false,
      published: false,
    });
  }

  // ============================================================
  // OPEN NEW NEWS FORM
  // ============================================================

  function openNewNewsForm() {
    setMessage("");
    setErrorMessage("");
    setNewsFormError("");
    setEditingNews(null);

    setNewsImageFile(null);
    setNewsImagePreview("");

    setNewsForm({
      title: "",
      slug: "",
      category: "News",
      excerpt: "",
      content: "",
      featured_image_url: "",
      image_contains_learners: false,
      consent_confirmed: false,
      published: false,
    });

    setShowNewsForm(true);
  }

  // ============================================================
  // OPEN NEW GALLERY FORM
  // ============================================================

  function openNewGalleryForm() {
    setMessage("");
    setErrorMessage("");
    setGalleryFormError("");
    setEditingGallery(null);

    setGalleryImageFile(null);
    setGalleryImagePreview("");

    setGalleryForm({
      image_url: "",
      title: "",
      caption: "",
      alt_text: "",
      category: "School Events",
      photo_type: "general",
      consent_confirmed: false,
      published: false,
    });

    setShowGalleryForm(true);
  }

  // ============================================================
  // CONFIRM LEARNER CONSENT - GALLERY
  // ============================================================

const confirmLearnerConsent = async () => {
  setShowConsentConfirmation(false);

  await submitGalleryPhoto(true);
};

  // ============================================================
  // CONFIRM LEARNER CONSENT - NEWS
  // ============================================================

const confirmNewsLearnerConsent = async () => {
  setShowNewsConsentConfirmation(false);

  // Pass true directly rather than waiting for React state
  // to update before submitting.
  await submitNewsArticle(true);
};

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


    // ============================================================
  // Filter News Articles
  // ============================================================
const filteredNewsArticles = newsArticles.filter((article) => {
  if (newsFilter === "published") return article.published;
  if (newsFilter === "draft") return !article.published;
  return true;
});

    // ============================================================
  // Filter Gallery Images
  // ============================================================
const filteredGalleryImages = galleryImages.filter((image) => {
  if (galleryFilter === "published") {return image.published === true;}
if (galleryFilter === "draft") {return image.published === false;}
return true;
});
   // ============================================================
// RENDER
// ============================================================

return (
  <div className="min-h-screen bg-[#f0f2f7]">
    <StaffSidebar />

    <main className="min-h-screen md:ml-[240px]">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-6 md:px-8 md:py-8">

        {/* ======================================================
            PAGE HEADER
            ====================================================== */}

        <div className="mb-8">
          <p className="text-sm font-medium text-[#5a6a82]">
            Staff Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0d2260] md:text-4xl">
            Media Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5a6a82]">
            Manage the news, announcements and gallery content
            displayed on the public website.
          </p>
        </div>

        {/* ======================================================
            PAGE MESSAGES
            ====================================================== */}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* ======================================================
            SECTION SELECTOR
            ====================================================== */}

        <div className="mb-8 grid gap-4 md:grid-cols-2">

          {/* NEWS CARD */}
          <button
            type="button"
            onClick={() => setActiveSection("news")}
            className={`group rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              activeSection === "news"
                ? "border-[#0d2260] bg-[#0d2260]"
                : "border-gray-200 bg-white hover:border-[#c9a227]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  activeSection === "news"
                    ? "bg-[#c9a227]/20 text-[#c9a227]"
                    : "bg-[#0d2260] text-[#c9a227]"
                }`}
              >
                <Newspaper className="h-5 w-5" />
              </div>

              <ArrowRight
                className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                  activeSection === "news"
                    ? "text-[#c9a227]"
                    : "text-gray-300"
                }`}
              />
            </div>

            <h2
              className={`mt-5 text-base font-bold ${
                activeSection === "news"
                  ? "text-white"
                  : "text-[#0d2260]"
              }`}
            >
              News & Announcements
            </h2>

            <p
              className={`mt-2 text-sm leading-6 ${
                activeSection === "news"
                  ? "text-blue-100"
                  : "text-[#5a6a82]"
              }`}
            >
              Create and manage school news, events, achievements,
              notices and Islamic announcements.
            </p>

            <div className="mt-4">
              <span
                className={`text-xs font-semibold ${
                  activeSection === "news"
                    ? "text-[#c9a227]"
                    : "text-[#5a6a82]"
                }`}
              >
                {newsArticles.length}{" "}
                {newsArticles.length === 1 ? "article" : "articles"}
              </span>
            </div>
          </button>

          {/* GALLERY CARD */}
          <button
            type="button"
            onClick={() => setActiveSection("gallery")}
            className={`group rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              activeSection === "gallery"
                ? "border-[#0d2260] bg-[#0d2260]"
                : "border-gray-200 bg-white hover:border-[#c9a227]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  activeSection === "gallery"
                    ? "bg-[#c9a227]/20 text-[#c9a227]"
                    : "bg-[#0d2260] text-[#c9a227]"
                }`}
              >
                <Images className="h-5 w-5" />
              </div>

              <ArrowRight
                className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                  activeSection === "gallery"
                    ? "text-[#c9a227]"
                    : "text-gray-300"
                }`}
              />
            </div>

            <h2
              className={`mt-5 text-base font-bold ${
                activeSection === "gallery"
                  ? "text-white"
                  : "text-[#0d2260]"
              }`}
            >
              Gallery
            </h2>

            <p
              className={`mt-2 text-sm leading-6 ${
                activeSection === "gallery"
                  ? "text-blue-100"
                  : "text-[#5a6a82]"
              }`}
            >
              Upload and manage school photographs from events,
              sport, academics, outings and Islamic activities.
            </p>

            <div className="mt-4">
              <span
                className={`text-xs font-semibold ${
                  activeSection === "gallery"
                    ? "text-[#c9a227]"
                    : "text-[#5a6a82]"
                }`}
              >
                {galleryImages.length}{" "}
                {galleryImages.length === 1 ? "photo" : "photos"}
              </span>
            </div>
          </button>
        </div>

        {/* ======================================================
            NEWS SECTION
            ====================================================== */}

        {activeSection === "news" && (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* NEWS HEADER */}
            <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0d2260]">
                  News & Announcements
                </h2>

                <p className="mt-1 text-sm text-[#5a6a82]">
                  Manage content displayed on the public News &
                  Announcements page.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">

                <select
                  value={newsFilter}
                  onChange={(event) =>
                    setNewsFilter(event.target.value)
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0d2260]"
                >
                  <option value="all">All Articles</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>

                <button
                  type="button"
                  onClick={openNewNewsForm}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0d2260] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0d2260]/90"
                >
                  <Plus className="h-4 w-4" />
                  Create Article
                </button>
              </div>
            </div>

            {/* NEWS CONTENT */}
            {loadingNews ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-[#5a6a82]">
                  Loading articles...
                </p>
              </div>
            ) : filteredNewsArticles.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d2260] text-[#c9a227]">
                  <Newspaper className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#0d2260]">
                  No news or announcements yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5a6a82]">
                  Articles created here will appear on the public
                  News & Announcements page once they are published.
                </p>

                <button
                  type="button"
                  onClick={openNewNewsForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0d2260] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2260]/90"
                >
                  <Plus className="h-4 w-4" />
                  Create Article
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">

                {filteredNewsArticles.map((article) => (
                  <div
                    key={article.id}
                    className="px-6 py-5 transition hover:bg-gray-50/70"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* ARTICLE INFORMATION */}
                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-[#0d2260]">
                            {article.title}
                          </h3>

                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            {article.category}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              article.published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {article.published
                              ? "Published"
                              : "Draft"}
                          </span>

                          {article.featured_image_url &&
                            article.image_contains_learners && (
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  article.consent_confirmed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {article.consent_confirmed
                                  ? "Learner consent confirmed"
                                  : "Consent required"}
                              </span>
                            )}
                        </div>

                        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[#5a6a82]">
                          {article.excerpt || article.content}
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                          Created {formatDate(article.created_at)}
                        </p>
                      </div>

                      {/* ARTICLE ACTIONS */}
                      <div className="flex shrink-0 flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() => openViewNews(article)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditNews(article)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNews(article)}
                          disabled={deletingId === article.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />

                          {deletingId === article.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </section>
        )}

        {/* ======================================================
            GALLERY SECTION
            ====================================================== */}

        {activeSection === "gallery" && (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* GALLERY HEADER */}
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h2 className="text-xl font-bold text-[#0d2260]">
      Gallery
    </h2>
    <p className="mt-1 text-sm text-[#5a6a82]">
      Manage school gallery photos and learner consent.
    </p>
  </div>

  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <select
      value={galleryFilter}
      onChange={(e) => setGalleryFilter(e.target.value)}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0d2260]"
    >
      <option value="all">All Photos</option>
      <option value="published">Published</option>
      <option value="draft">Drafts</option>
    </select>

    <button
      type="button"
      onClick={openNewGalleryForm}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0d2260] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162f7a]"
    >
      <Plus className="h-4 w-4" />
      Add Photo
    </button>
  </div>
</div>

            {/* GALLERY CONTENT */}
            {loadingGallery ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-[#5a6a82]">
                  Loading gallery...
                </p>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="px-6 py-16 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d2260] text-[#c9a227]">
                  <Images className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#0d2260]">
                  No gallery photos yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5a6a82]">
                  Photos uploaded here will appear on the public
                  gallery once they are published.
                </p>

                <button
                  type="button"
                  onClick={openNewGalleryForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0d2260] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2260]/90"
                >
                  <Plus className="h-4 w-4" />
                  Add Photo
                </button>

              </div>
            ) : (
              <div className="divide-y divide-gray-100">

                {filteredGalleryImages.map((image) => (
                  <div
                    key={image.id}
                    className="px-6 py-5 transition hover:bg-gray-50/70"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* IMAGE INFORMATION */}
                      <div className="flex min-w-0 flex-1 gap-4">

                        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {image.image_url ? (
                            <img
                              src={image.image_url}
                              alt={
                                image.alt_text ||
                                image.title ||
                                "Gallery image"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-[#0d2260]">
                              {image.title || "Untitled photo"}
                            </h3>

                            {image.category && (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                {image.category}
                              </span>
                            )}

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                image.published
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {image.published
                                ? "Published"
                                : "Draft"}
                            </span>

                            {image.photo_type === "learners" && (
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  image.consent_confirmed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {image.consent_confirmed
                                  ? "Learner consent confirmed"
                                  : "Consent required"}
                              </span>
                            )}

                          </div>

                          {image.caption && (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5a6a82]">
                              {image.caption}
                            </p>
                          )}

                          <p className="mt-2 text-xs text-gray-400">
                            Uploaded {formatDate(image.created_at)}
                          </p>

                        </div>
                      </div>

                      {/* IMAGE ACTIONS */}
                      <div className="flex shrink-0 flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() => {
                            setViewItem(image);
                            setViewType("gallery");
                            setShowViewModal(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditGalleryForm(image)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryPhoto(image)}
                          disabled={deletingId === image.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />

                          {deletingId === image.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </section>
        )}

        {/* ======================================================
            NEWS FORM MODAL
            ====================================================== */}

        {showNewsForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">

            <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold text-[#0d2260]">
                    {editingNews
                      ? "Edit Article"
                      : "Create Article"}
                  </h2>

                  <p className="mt-1 text-sm text-[#5a6a82]">
                    {editingNews
                      ? "Update the article details."
                      : "Create a news article or school announcement."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeNewsForm}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* FORM */}
              <form
                onSubmit={handleCreateArticle}
                noValidate
                className="max-h-[calc(92vh-90px)] space-y-5 overflow-y-auto px-6 py-6"
              >

                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Title <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={newsForm.title}
                    onChange={handleNewsTitleChange}
                    placeholder="Enter article title"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  />
                </div>

                {/* SLUG */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Slug <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="slug"
                    value={newsForm.slug}
                    onChange={handleNewsFormChange}
                    placeholder="article-url-slug"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    {editingNews
                      ? "This is used in the article URL."
                      : "Generated automatically from the title. You can edit it if needed."}
                  </p>
                </div>

                {/* CATEGORY */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Category <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="category"
                    value={newsForm.category}
                    onChange={handleNewsFormChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  >
                    <option value="News">News</option>
                    <option value="Announcements">Announcements</option>
                    <option value="Events">Events</option>
                    <option value="Achievements">Achievements</option>
                    <option value="Notices">Notices</option>
                    <option value="Islamic">Islamic</option>
                  </select>
                </div>

                {/* EXCERPT */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Excerpt
                    <span className="ml-1 font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    name="excerpt"
                    value={newsForm.excerpt}
                    onChange={handleNewsFormChange}
                    rows={3}
                    placeholder="Short summary of the article"
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  />
                </div>

                {/* CONTENT */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Content <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    name="content"
                    value={newsForm.content}
                    onChange={handleNewsFormChange}
                    rows={8}
                    placeholder="Write the full article here..."
                    className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  />
                </div>

                {/* FEATURED IMAGE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Featured Image
                    <span className="ml-1 font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5">

                    {newsImagePreview ? (
                      <div className="space-y-4">

                        <div className="overflow-hidden rounded-lg bg-white">
                          <img
                            src={newsImagePreview}
                            alt="Featured image preview"
                            className="max-h-64 w-full object-contain"
                          />
                        </div>

                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                          <Upload className="h-4 w-4" />
                          Choose a different image

                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleNewsImageChange}
                            className="hidden"
                          />
                        </label>

                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center py-8">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0d2260] text-[#c9a227]">
                          <ImageIcon className="h-6 w-6" />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-[#0d2260]">
                          Choose an image from your computer
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG or WEBP • Maximum 10 MB
                        </p>

                        <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0d2260] px-4 py-2.5 text-xs font-semibold text-white">
                          <Upload className="h-4 w-4" />
                          Choose Image
                        </span>

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleNewsImageChange}
                          className="hidden"
                        />

                      </label>
                    )}

                  </div>

                  {editingNews &&
                    !newsImageFile &&
                    newsForm.featured_image_url && (
                      <p className="mt-2 text-xs text-gray-500">
                        The existing featured image will be kept unless
                        you choose a new image.
                      </p>
                    )}
                </div>

                {/* LEARNER IMAGE */}
                {(newsImagePreview ||
                  newsForm.featured_image_url) && (
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                      Does this image contain learners?{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={
                        newsForm.image_contains_learners
                          ? "yes"
                          : "no"
                      }
                      onChange={(event) => {
                        const containsLearners =
                          event.target.value === "yes";

                        setNewsForm((previous) => ({
                          ...previous,
                          image_contains_learners:
                            containsLearners,
                          consent_confirmed:
                            containsLearners
                              ? previous.consent_confirmed
                              : false,
                        }));

                        setNewsFormError("");
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                    >
                      <option value="no">
                        No — No learners are visible
                      </option>

                      <option value="yes">
                        Yes — Learners are visible
                      </option>
                    </select>

                    {newsForm.image_contains_learners && (
                      <div className="mt-3 space-y-3">

                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                          <div className="flex gap-3">

                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                            <div>
                              <p className="text-sm font-semibold text-amber-900">
                                Parent/guardian consent required
                              </p>

                              <p className="mt-1 text-xs leading-5 text-amber-800">
                                Consent must be confirmed before this
                                article can be published with the
                                learner image.
                              </p>
                            </div>

                          </div>
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">

                          <input
                            type="checkbox"
                            checked={newsForm.consent_confirmed}
                            onChange={(event) => {
                              setNewsForm((previous) => ({
                                ...previous,
                                consent_confirmed:
                                  event.target.checked,
                              }));

                              setNewsFormError("");
                            }}
                            className="mt-1 h-4 w-4 accent-[#0d2260]"
                          />

                          <span className="text-sm leading-6 text-gray-700">
                            I confirm that the required
                            parent/guardian consent has been obtained
                            for the learners shown in this image.

                            {newsForm.published && (
                              <span className="ml-1 text-red-500">
                                *
                              </span>
                            )}
                          </span>

                        </label>

                        {newsForm.consent_confirmed && (
                          <p className="text-xs font-semibold text-green-700">
                            ✓ Parent/guardian consent confirmed
                          </p>
                        )}

                      </div>
                    )}

                  </div>
                )}

                {/* PUBLISH */}
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">

                  <input
                    type="checkbox"
                    name="published"
                    checked={newsForm.published}
                    onChange={handleNewsFormChange}
                    className="mt-1 h-4 w-4 accent-[#0d2260]"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-[#0d2260]">
                      Publish immediately
                    </span>

                    <span className="mt-1 block text-xs text-[#5a6a82]">
                      If unchecked, the article will be saved as a
                      draft.
                    </span>
                  </span>

                </label>

                {/* ERROR */}
                {newsFormError && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{newsFormError}</p>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                  <button
                    type="button"
                    onClick={closeNewsForm}
                    disabled={submitting}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-[#0d2260] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2260]/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? editingNews
                        ? "Saving..."
                        : "Uploading & Creating..."
                      : editingNews
                      ? "Save Changes"
                      : "Create Article"}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

        {/* ======================================================
            GALLERY FORM MODAL
            ====================================================== */}

        {showGalleryForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">

            <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold text-[#0d2260]">
                    {editingGallery
                      ? "Edit Photo"
                      : "Upload Photo"}
                  </h2>

                  <p className="mt-1 text-sm text-[#5a6a82]">
                    {editingGallery
                      ? "Update the gallery photo details."
                      : "Upload a photo to the school gallery."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeGalleryForm}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* FORM */}
              <form
                onSubmit={handleUploadPhoto}
                noValidate
                className="max-h-[calc(92vh-90px)] space-y-5 overflow-y-auto px-6 py-6"
              >

                {/* IMAGE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Image <span className="text-red-500">*</span>
                  </label>

                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5">

                    {galleryImagePreview ? (
                      <div className="space-y-4">

                        <div className="overflow-hidden rounded-lg bg-white">
                          <img
                            src={galleryImagePreview}
                            alt="Gallery image preview"
                            className="max-h-72 w-full object-contain"
                          />
                        </div>

                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                          <Upload className="h-4 w-4" />
                          Choose a different image

                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleGalleryImageChange}
                            className="hidden"
                          />
                        </label>

                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center py-8">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0d2260] text-[#c9a227]">
                          <ImageIcon className="h-6 w-6" />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-[#0d2260]">
                          Choose an image from your computer
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG or WEBP • Maximum 10 MB
                        </p>

                        <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0d2260] px-4 py-2.5 text-xs font-semibold text-white">
                          <Upload className="h-4 w-4" />
                          Choose Image
                        </span>

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleGalleryImageChange}
                          className="hidden"
                        />

                      </label>
                    )}

                  </div>
                </div>

                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Title
                    <span className="ml-1 font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={galleryForm.title}
                    onChange={handleGalleryFormChange}
                    placeholder="Enter a title for the photo"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  />
                </div>

                {/* CAPTION */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Caption
                    <span className="ml-1 font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    name="caption"
                    value={galleryForm.caption}
                    onChange={handleGalleryFormChange}
                    rows={3}
                    placeholder="Add a short description or caption"
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  />
                </div>

                {/* ALT TEXT */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Alt Text <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="alt_text"
                    value={galleryForm.alt_text}
                    onChange={handleGalleryFormChange}
                    placeholder="Describe the image for accessibility"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Briefly describe what is shown in the image.
                  </p>
                </div>

                {/* CATEGORY */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Category <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="category"
                    value={galleryForm.category}
                    onChange={handleGalleryFormChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  >
                    <option value="School Events">
                      School Events
                    </option>
                    <option value="Academics">Academics</option>
                    <option value="Sport">Sport</option>
                    <option value="Outings">Outings</option>
                    <option value="Islamic Activities">
                      Islamic Activities
                    </option>
                    <option value="Achievements">
                      Achievements
                    </option>
                    <option value="General">General</option>
                  </select>
                </div>

                {/* PHOTO TYPE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                    Photo Type <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="photo_type"
                    value={galleryForm.photo_type}
                    onChange={handleGalleryFormChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  >
                    <option value="general">
                      General — No learners visible
                    </option>

                    <option value="learners">
                      Learners — Learners are visible
                    </option>
                  </select>

                  <p className="mt-1 text-xs text-gray-400">
                    Select "Learners" if identifiable learners are
                    visible in the photograph.
                  </p>
                </div>

                {/* LEARNER CONSENT */}
                {galleryForm.photo_type === "learners" && (
                  <div className="space-y-3">

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex gap-3">

                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                        <div>
                          <p className="text-sm font-semibold text-amber-900">
                            Parent/guardian consent required
                          </p>

                          <p className="mt-1 text-xs leading-5 text-amber-800">
                            Parent/guardian consent must be confirmed
                            before a learner photograph can be
                            published on the public website.
                          </p>
                        </div>

                      </div>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">

                      <input
                        type="checkbox"
                        name="consent_confirmed"
                        checked={galleryForm.consent_confirmed}
                        onChange={handleGalleryFormChange}
                        className="mt-1 h-4 w-4 accent-[#0d2260]"
                      />

                      <span className="text-sm leading-6 text-gray-700">
                        I confirm that the required parent/guardian
                        consent has been obtained for the learners
                        shown in this photograph.

                        {galleryForm.published && (
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        )}
                      </span>

                    </label>

                    {galleryForm.consent_confirmed && (
                      <p className="text-xs font-semibold text-green-700">
                        ✓ Parent/guardian consent confirmed
                      </p>
                    )}

                  </div>
                )}

                {/* PUBLISH */}
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">

                  <input
                    type="checkbox"
                    name="published"
                    checked={galleryForm.published}
                    onChange={handleGalleryFormChange}
                    className="mt-1 h-4 w-4 accent-[#0d2260]"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-[#0d2260]">
                      Publish immediately
                    </span>

                    <span className="mt-1 block text-xs text-[#5a6a82]">
                      If unchecked, the photograph will be saved as
                      a draft and will not appear on the public
                      gallery.
                    </span>
                  </span>

                </label>

                {/* ERROR */}
                {galleryFormError && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{galleryFormError}</p>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                  <button
                    type="button"
                    onClick={closeGalleryForm}
                    disabled={submitting}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-[#0d2260] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2260]/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? editingGallery
                        ? "Saving..."
                        : "Uploading..."
                      : editingGallery
                      ? "Save Changes"
                      : "Upload Photo"}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

        {/* ======================================================
            VIEW MODAL
            ====================================================== */}

        {showViewModal && viewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">

            <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#c9a227]">
                    Media Management
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#0d2260]">
                    View{" "}
                    {viewType === "news"
                      ? "Article"
                      : "Photo"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setViewItem(null);
                    setViewType(null);
                  }}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* CONTENT */}
              <div className="max-h-[calc(92vh-90px)] overflow-y-auto p-6">

                {/* NEWS VIEW */}
                {viewType === "news" ? (
                  <div className="space-y-6">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Title
                      </p>

                      <h3 className="mt-1 text-2xl font-bold text-[#0d2260]">
                        {viewItem.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {viewItem.category}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          viewItem.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {viewItem.published
                          ? "Published"
                          : "Draft"}
                      </span>

                      {viewItem.featured_image_url &&
                        viewItem.image_contains_learners && (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              viewItem.consent_confirmed
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {viewItem.consent_confirmed
                              ? "Learner consent confirmed"
                              : "Consent required"}
                          </span>
                        )}

                    </div>

                    {viewItem.excerpt && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Excerpt
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-700">
                          {viewItem.excerpt}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Content
                      </p>

                      <div className="mt-2 whitespace-pre-wrap rounded-xl bg-gray-50 p-5 text-sm leading-7 text-gray-700">
                        {viewItem.content}
                      </div>
                    </div>

                    {viewItem.featured_image_url && (
                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Featured Image
                        </p>

                        <div className="mt-2 overflow-hidden rounded-xl bg-gray-100">
                          <img
                            src={viewItem.featured_image_url}
                            alt={viewItem.title || ""}
                            className="max-h-96 w-full object-contain"
                          />
                        </div>

                        {viewItem.image_contains_learners && (
                          <p className="mt-2 text-xs text-gray-500">
                            This image contains learners.
                            Consent status:{" "}
                            {viewItem.consent_confirmed
                              ? "Confirmed"
                              : "Not confirmed"}
                          </p>
                        )}

                      </div>
                    )}

                    <div className="grid gap-3 border-t border-gray-100 pt-5 text-xs text-gray-400 sm:grid-cols-2">

                      <p>
                        <span className="font-semibold text-gray-500">
                          Slug:
                        </span>{" "}
                        {viewItem.slug || "—"}
                      </p>

                      <p>
                        <span className="font-semibold text-gray-500">
                          Created:
                        </span>{" "}
                        {formatDate(viewItem.created_at)}
                      </p>

                    </div>

                  </div>
                ) : (
                  /* GALLERY VIEW */
                  <div className="space-y-6">

                    <div className="overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={viewItem.image_url}
                        alt={viewItem.alt_text || ""}
                        className="max-h-[500px] w-full object-contain"
                      />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#0d2260]">
                        {viewItem.title || "Untitled photo"}
                      </h3>

                      {viewItem.caption && (
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {viewItem.caption}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">

                      {viewItem.category && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          {viewItem.category}
                        </span>
                      )}

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {viewItem.photo_type === "learners"
                          ? "Learners visible"
                          : "General school photo"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          viewItem.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {viewItem.published
                          ? "Published"
                          : "Draft"}
                      </span>

                      {viewItem.photo_type === "learners" && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            viewItem.consent_confirmed
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {viewItem.consent_confirmed
                            ? "Consent confirmed"
                            : "Consent not confirmed"}
                        </span>
                      )}

                    </div>

                    <div className="grid gap-3 border-t border-gray-100 pt-5 text-xs text-gray-400 sm:grid-cols-2">

                      <p>
                        <span className="font-semibold text-gray-500">
                          Alt text:
                        </span>{" "}
                        {viewItem.alt_text || "—"}
                      </p>

                      <p>
                        <span className="font-semibold text-gray-500">
                          Uploaded:
                        </span>{" "}
                        {formatDate(viewItem.created_at)}
                      </p>

                    </div>

                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  </div>
);
}