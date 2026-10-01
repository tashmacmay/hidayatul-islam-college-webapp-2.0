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
  const [showConsentConfirmation, setShowConsentConfirmation] =
    useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

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
    published: false,
  });

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

      // Supports either:
      // { news: [...] }
      // or simply [...]
      setNewsArticles(
        Array.isArray(data) ? data : data.news || []
      );
    } catch (error) {
      console.error("Load news error:", error);
      setErrorMessage(error.message || "Failed to load news.");
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

      // Supports either:
      // { gallery: [...] }
      // or simply [...]
      setGalleryImages(
        Array.isArray(data) ? data : data.gallery || []
      );
    } catch (error) {
      console.error("Load gallery error:", error);
      setErrorMessage(error.message || "Failed to load gallery.");
    } finally {
      setLoadingGallery(false);
    }
  };

  // ============================================================
  // NEWS FORM CHANGE
  // ============================================================

  function handleFormChange(event) {
    const { name, value, type, checked } = event.target;

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

    setGalleryForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

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
  // NEWS TITLE CHANGE
  // ============================================================

  function handleNewsTitleChange(event) {
    const title = event.target.value;

    setNewsForm((previous) => ({
      ...previous,
      title,

      // When editing, keep the existing slug unless
      // the user manually changes it.
      slug: editingNews
        ? previous.slug
        : generateSlug(title),
    }));
  }

  // ============================================================
  // CREATE / UPDATE NEWS
  // ============================================================

  const handleCreateArticle = async (event) => {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!newsForm.title.trim()) {
      setErrorMessage("Please enter a title.");
      return;
    }

    if (!newsForm.content.trim()) {
      setErrorMessage("Please enter the article content.");
      return;
    }

    if (!newsForm.slug.trim()) {
      setErrorMessage("Please enter a slug.");
      return;
    }

    try {
      setSubmitting(true);

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
          featured_image_url: newsForm.featured_image_url,
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
      setErrorMessage(
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

    if (!galleryForm.image_url.trim()) {
      setErrorMessage("Please enter an image URL.");
      return;
    }

    if (!galleryForm.alt_text.trim()) {
      setErrorMessage("Please enter alt text for the image.");
      return;
    }

    // Learner photos that are being published require consent.
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

      const token = await getAuthToken();

      const finalConsent =
        galleryForm.photo_type === "learners"
          ? consentConfirmed || galleryForm.consent_confirmed
          : false;

      // Extra frontend protection.
      if (
        galleryForm.photo_type === "learners" &&
        galleryForm.published &&
        !finalConsent
      ) {
        setErrorMessage(
          "Parent/guardian consent must be confirmed before publishing a learner photo."
        );
        return;
      }

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
          image_url: galleryForm.image_url,
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

      setErrorMessage(
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

    setEditingNews(article);

    setNewsForm({
      title: article.title || "",
      slug: article.slug || "",
      category: article.category || "News",
      excerpt: article.excerpt || "",
      content: article.content || "",
      featured_image_url: article.featured_image_url || "",
      published: Boolean(article.published),
    });

    setShowNewsForm(true);
  };

  // ============================================================
  // EDIT GALLERY
  // ============================================================

  const openEditGallery = (image) => {
    setMessage("");
    setErrorMessage("");

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

    setNewsForm({
      title: "",
      slug: "",
      category: "News",
      excerpt: "",
      content: "",
      featured_image_url: "",
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
    setEditingNews(null);

    setNewsForm({
      title: "",
      slug: "",
      category: "News",
      excerpt: "",
      content: "",
      featured_image_url: "",
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
    setEditingGallery(null);

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
  // CONFIRM LEARNER CONSENT
  // ============================================================

  const confirmLearnerConsent = async () => {
    setShowConsentConfirmation(false);

    setGalleryForm((previous) => ({
      ...previous,
      consent_confirmed: true,
    }));

    await submitGalleryPhoto(true);
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
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f0f2f7]">

      {/* ======================================================
          STAFF SIDEBAR
          ====================================================== */}

      <StaffSidebar />

      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <main className="min-h-screen md:ml-[240px]">

        <div className="mx-auto w-full max-w-[1600px] px-6 py-6 md:px-8 md:py-8">

          {/* ==================================================
              PAGE HEADER
              ================================================== */}

          <div className="mb-8">

            <p className="text-sm text-[#5a6a82]">
              Staff Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#0d2260] md:text-4xl">
              Media Management
            </h1>

            <p className="mt-2 text-sm text-[#5a6a82]">
              Manage the news, announcements and gallery content
              displayed on the public website.
            </p>

          </div>

          {/* ==================================================
              SUCCESS / ERROR MESSAGES
              ================================================== */}

          {message && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="h-5 w-5" />
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-5 w-5" />
              {errorMessage}
            </div>
          )}

          {/* ==================================================
              SECTION BUTTONS
              ================================================== */}

          <div className="mb-8 grid gap-4 md:grid-cols-2">

            {/* NEWS */}

            <button
              type="button"
              onClick={() => setActiveSection("news")}
              className={`group rounded-xl border p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md ${
                activeSection === "news"
                  ? "border-[#0d2260] bg-[#0d2260]"
                  : "border-gray-100 bg-white hover:border-[#c9a227]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    activeSection === "news"
                      ? "bg-[#c9a227]/20 text-[#c9a227]"
                      : "bg-[#0d2260] text-[#c9a227]"
                  }`}
                >
                  <Newspaper className="h-6 w-6" />
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

              <p
                className={`mt-3 text-xs font-semibold ${
                  activeSection === "news"
                    ? "text-[#c9a227]"
                    : "text-[#5a6a82]"
                }`}
              >
                {newsArticles.length}{" "}
                {newsArticles.length === 1
                  ? "article"
                  : "articles"}
              </p>

            </button>

            {/* GALLERY */}

            <button
              type="button"
              onClick={() => setActiveSection("gallery")}
              className={`group rounded-xl border p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md ${
                activeSection === "gallery"
                  ? "border-[#0d2260] bg-[#0d2260]"
                  : "border-gray-100 bg-white hover:border-[#c9a227]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    activeSection === "gallery"
                      ? "bg-[#c9a227]/20 text-[#c9a227]"
                      : "bg-[#0d2260] text-[#c9a227]"
                  }`}
                >
                  <Images className="h-6 w-6" />
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

              <p
                className={`mt-3 text-xs font-semibold ${
                  activeSection === "gallery"
                    ? "text-[#c9a227]"
                    : "text-[#5a6a82]"
                }`}
              >
                {galleryImages.length}{" "}
                {galleryImages.length === 1
                  ? "photo"
                  : "photos"}
              </p>

            </button>

          </div>

          {/* ==================================================
              NEWS SECTION
              ================================================== */}

          {activeSection === "news" ? (

            <section className="rounded-xl border border-gray-100 bg-white shadow-sm">

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

                <button
                  type="button"
                  onClick={openNewNewsForm}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0d2260] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0d2260]/90"
                >
                  <Plus className="h-4 w-4" />
                  Create Article
                </button>

              </div>

              {/* NEWS LIST */}

              {loadingNews ? (

                <div className="px-6 py-14 text-center text-sm text-[#5a6a82]">
                  Loading articles...
                </div>

              ) : newsArticles.length === 0 ? (

                <div className="px-6 py-14 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#0d2260] text-[#c9a227]">
                    <Newspaper className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#0d2260]">
                    No news or announcements yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5a6a82]">
                    Articles created here will appear on the public
                    News & Announcements page once they are published.
                  </p>

                </div>

              ) : (

                <div className="divide-y divide-gray-100">

                  {newsArticles.map((article) => (

                    <div
                      key={article.id}
                      className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                    >

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-[#0d2260]">
                            {article.title}
                          </h3>

                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                            {article.category}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs ${
                              article.published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {article.published
                              ? "Published"
                              : "Draft"}
                          </span>

                        </div>

                        <p className="mt-2 line-clamp-2 text-sm text-[#5a6a82]">
                          {article.excerpt ||
                            article.content}
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                          Created{" "}
                          {formatDate(article.created_at)}
                        </p>

                      </div>

                      {/* ACTION BUTTONS */}

                      <div className="flex shrink-0 flex-wrap items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openViewNews(article)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditNews(article)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteNews(article)
                          }
                          disabled={
                            deletingId === article.id
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />

                          {deletingId === article.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

          ) : (

            /* ==================================================
               GALLERY SECTION
               ================================================== */

            <section className="rounded-xl border border-gray-100 bg-white shadow-sm">

              <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-lg font-bold text-[#0d2260]">
                    Gallery
                  </h2>

                  <p className="mt-1 text-sm text-[#5a6a82]">
                    Upload and manage photographs displayed on the
                    public Gallery page.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={openNewGalleryForm}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0d2260] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0d2260]/90"
                >
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </button>

              </div>

              {/* GALLERY LIST */}

              {loadingGallery ? (

                <div className="px-6 py-14 text-center text-sm text-[#5a6a82]">
                  Loading gallery...
                </div>

              ) : galleryImages.length === 0 ? (

                <div className="px-6 py-14 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#0d2260] text-[#c9a227]">
                    <Images className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#0d2260]">
                    No gallery images yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5a6a82]">
                    Photos uploaded here will appear on the public
                    Gallery page after the required consent and
                    publishing checks.
                  </p>

                </div>

              ) : (

                <div className="grid gap-6 p-6 sm:grid-cols-2 xl:grid-cols-3">

                  {galleryImages.map((image) => (

                    <div
                      key={image.id}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >

                      {/* IMAGE */}

                      <div className="aspect-video bg-gray-100">

                        <img
                          src={image.image_url}
                          alt={image.alt_text || ""}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                      </div>

                      {/* DETAILS */}

                      <div className="p-4">

                        <div className="flex items-start justify-between gap-2">

                          <div className="min-w-0">

                            <h3 className="truncate font-semibold text-[#0d2260]">
                              {image.title ||
                                "Untitled photo"}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {image.category}
                            </p>

                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                              image.published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {image.published
                              ? "Published"
                              : "Draft"}
                          </span>

                        </div>

                        {/* PHOTO TYPE / CONSENT */}

                        <div className="mt-3 flex flex-wrap gap-2">

                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                            {image.photo_type ===
                            "learners"
                              ? "Learners"
                              : "General"}
                          </span>

                          {image.photo_type ===
                            "learners" && (

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs ${
                                image.consent_confirmed
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {image.consent_confirmed
                                ? "Consent confirmed"
                                : "Consent not confirmed"}
                            </span>

                          )}

                        </div>

                        <p className="mt-3 text-xs text-gray-400">
                          Uploaded{" "}
                          {formatDate(image.created_at)}
                        </p>

                        {/* ACTION BUTTONS */}

                        <div className="mt-4 flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openViewGallery(image)
                            }
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                          >
                            <Eye className="mr-1 inline h-4 w-4" />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditGallery(image)
                            }
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                          >
                            <Pencil className="mr-1 inline h-4 w-4" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteGallery(image)
                            }
                            disabled={
                              deletingId === image.id
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

          )}

        </div>

      </main>

      {/* ======================================================
          NEWS FORM MODAL
          ====================================================== */}

      {showNewsForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

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
              className="space-y-5 px-6 py-6"
            >

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={newsForm.title}
                  onChange={handleNewsTitleChange}
                  placeholder="Enter article title"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  required
                />

              </div>

              {/* SLUG */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Slug
                </label>

                <input
                  type="text"
                  name="slug"
                  value={newsForm.slug}
                  onChange={handleFormChange}
                  placeholder="article-url-slug"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  required
                />

                <p className="mt-1 text-xs text-gray-400">
                  This will be used in the article URL.
                </p>

              </div>

              {/* CATEGORY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Category
                </label>

                <select
                  name="category"
                  value={newsForm.category}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                >
                  <option value="News">News</option>
                  <option value="Events">Events</option>
                  <option value="Achievements">
                    Achievements
                  </option>
                  <option value="Notices">Notices</option>
                  <option value="Islamic">Islamic</option>
                </select>

              </div>

              {/* EXCERPT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Excerpt
                </label>

                <textarea
                  name="excerpt"
                  value={newsForm.excerpt}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Short summary of the article"
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                />

              </div>

              {/* CONTENT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Content
                </label>

                <textarea
                  name="content"
                  value={newsForm.content}
                  onChange={handleFormChange}
                  rows={8}
                  placeholder="Write the full article here..."
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  required
                />

              </div>

              {/* FEATURED IMAGE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Featured Image URL
                </label>

                <input
                  type="url"
                  name="featured_image_url"
                  value={newsForm.featured_image_url}
                  onChange={handleFormChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                />

              </div>

              {/* PUBLISH */}

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">

                <input
                  type="checkbox"
                  name="published"
                  checked={newsForm.published}
                  onChange={handleFormChange}
                  className="mt-1 h-4 w-4 accent-[#0d2260]"
                />

                <span>

                  <span className="block text-sm font-semibold text-[#0d2260]">
                    Publish immediately
                  </span>

                  <span className="mt-1 block text-xs text-[#5a6a82]">
                    If unchecked, the article will be saved as a draft.
                  </span>

                </span>

              </label>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                <button
                  type="button"
                  onClick={closeNewsForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
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
                      : "Creating..."
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

      {showGalleryForm && !showConsentConfirmation && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-[#0d2260]">
                  {editingGallery
                    ? "Edit Gallery Photo"
                    : "Upload Gallery Photo"}
                </h2>

                <p className="mt-1 text-sm text-[#5a6a82]">
                  {editingGallery
                    ? "Update the gallery photo details."
                    : "Add a photograph to the school gallery."}
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
              className="space-y-5 px-6 py-6"
            >

              {/* IMAGE URL */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Image URL
                </label>

                <input
                  type="url"
                  name="image_url"
                  value={galleryForm.image_url}
                  onChange={handleGalleryFormChange}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  required
                />

                <p className="mt-1 text-xs text-gray-400">
                  The image URL will be stored in the database.
                </p>

              </div>

              {/* PHOTO TYPE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Does this photo contain learners?
                </label>

                <select
                  name="photo_type"
                  value={galleryForm.photo_type}
                  onChange={handleGalleryFormChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                >

                  <option value="general">
                    No — General photo of the school
                  </option>

                  <option value="learners">
                    Yes — Learners are visible
                  </option>

                </select>

                {galleryForm.photo_type ===
                  "learners" && (

                  <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    Parent/guardian consent must be confirmed
                    before this photograph can be published.
                  </p>

                )}

              </div>

              {/* CATEGORY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Category
                </label>

                <select
                  name="category"
                  value={galleryForm.category}
                  onChange={handleGalleryFormChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                >
                  <option value="Sport">Sport</option>
                  <option value="Islamic Events">
                    Islamic Events
                  </option>
                  <option value="Academic">Academic</option>
                  <option value="School Events">
                    School Events
                  </option>
                  <option value="Outings">Outings</option>
                </select>

              </div>

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={galleryForm.title}
                  onChange={handleGalleryFormChange}
                  placeholder="Photo title"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                />

              </div>

              {/* CAPTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Caption
                </label>

                <textarea
                  name="caption"
                  value={galleryForm.caption}
                  onChange={handleGalleryFormChange}
                  rows={3}
                  placeholder="Optional caption"
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                />

              </div>

              {/* ALT TEXT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0d2260]">
                  Alt Text
                </label>

                <input
                  type="text"
                  name="alt_text"
                  value={galleryForm.alt_text}
                  onChange={handleGalleryFormChange}
                  placeholder="Describe the image for accessibility"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0d2260] focus:ring-2 focus:ring-[#0d2260]/10"
                  required
                />

              </div>

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
                    If unchecked, the photo will be saved as a draft.
                  </span>

                </span>

              </label>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                <button
                  type="button"
                  onClick={closeGalleryForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
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

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-[#0d2260]">
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

            <div className="p-6">

              {viewType === "news" ? (

                <div className="space-y-5">

                  <div>

                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Title
                    </span>

                    <h3 className="mt-1 text-2xl font-bold text-[#0d2260]">
                      {viewItem.title}
                    </h3>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      {viewItem.category}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        viewItem.published
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {viewItem.published
                        ? "Published"
                        : "Draft"}
                    </span>

                  </div>

                  {viewItem.excerpt && (

                    <div>

                      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Excerpt
                      </span>

                      <p className="mt-1 text-sm leading-6 text-gray-700">
                        {viewItem.excerpt}
                      </p>

                    </div>

                  )}

                  <div>

                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Content
                    </span>

                    <div className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                      {viewItem.content}
                    </div>

                  </div>

                  {viewItem.featured_image_url && (

                    <div>

                      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Featured Image
                      </span>

                      <img
                        src={viewItem.featured_image_url}
                        alt={viewItem.title || ""}
                        className="mt-2 max-h-80 w-full rounded-lg object-cover"
                      />

                    </div>

                  )}

                  <div className="text-xs text-gray-400">
                    Created{" "}
                    {formatDate(
                      viewItem.created_at
                    )}
                  </div>

                </div>

              ) : (

                <div className="space-y-5">

                  <div className="overflow-hidden rounded-xl bg-gray-100">

                    <img
                      src={viewItem.image_url}
                      alt={viewItem.alt_text || ""}
                      className="max-h-[500px] w-full object-contain"
                    />

                  </div>

                  <div>

                    <h3 className="text-xl font-bold text-[#0d2260]">
                      {viewItem.title ||
                        "Untitled photo"}
                    </h3>

                    {viewItem.caption && (

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {viewItem.caption}
                      </p>

                    )}

                  </div>

                  <div className="flex flex-wrap gap-2">

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      {viewItem.category}
                    </span>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      {viewItem.photo_type ===
                      "learners"
                        ? "Learners visible"
                        : "General school photo"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        viewItem.published
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {viewItem.published
                        ? "Published"
                        : "Draft"}
                    </span>

                    {viewItem.photo_type ===
                      "learners" && (

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
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

                  <div className="text-xs text-gray-400">
                    Uploaded{" "}
                    {formatDate(
                      viewItem.created_at
                    )}
                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

      {/* ======================================================
          PARENT CONSENT CONFIRMATION
          ====================================================== */}

      {showConsentConfirmation && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#0d2260]">
              Parent/Guardian Consent Required
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#5a6a82]">
              This photograph contains learners. Please confirm
              that the appropriate parent or guardian consent has
              been received before publishing this photograph.
            </p>

            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">

              <p className="text-xs leading-5 text-amber-800">
                By confirming, you are recording that the required
                consent has been received for the learners shown in
                this photograph.
              </p>

            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setShowConsentConfirmation(false)
                }
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={confirmLearnerConsent}
                disabled={submitting}
                className="rounded-lg bg-[#0d2260] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2260]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : "I Confirm Consent"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}