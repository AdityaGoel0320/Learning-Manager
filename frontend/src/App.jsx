import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://learning-manager.onrender.com/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function formatTimestamp(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const datePart = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${datePart}, ${timePart}`;
}

const alphaSorter = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

function IconSun({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
    </svg>
  );
}

function IconMoon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function IconPlus({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconSwap({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M17 3l4 4-4 4" />
      <path d="M3 7h18" />
      <path d="M7 21l-4-4 4-4" />
      <path d="M21 17H3" />
    </svg>
  );
}

function IconTrash({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 10v7M14 10v7" />
    </svg>
  );
}

function IconClock({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconCheck({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function IconEdit({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 17.25V21h3.75L18.8 8.95l-3.75-3.75L3 17.25Z" />
      <path d="m14.98 5.02 3.75 3.75" />
    </svg>
  );
}

function App() {
  const [theme, setTheme] = useState("dark");
  const [topics, setTopics] = useState([]);
  const [learningItems, setLearningItems] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    onConfirm: null,
  });
  const [topicEditor, setTopicEditor] = useState({
    isOpen: false,
    topicId: "",
    topicName: "",
    orderNumber: "",
  });

  const [form, setForm] = useState({
    orderNumber: "",
    topic: "",
    subTopic: "",
    description: "",
    status: "pending",
  });

  const nextGlobalOrderNumber = useMemo(() => {
    if (learningItems.length === 0) {
      return 1;
    }

    return learningItems.reduce((maxOrder, item) => {
      const currentOrder = Number(item.orderNumber) || 0;
      return Math.max(maxOrder, currentOrder);
    }, 0) + 1;
  }, [learningItems]);

  const selectedTopicSavedOrder = useMemo(() => {
    if (!form.topic) {
      return null;
    }

    const matched = learningItems.find((item) => item.topic?._id === form.topic);
    return matched ? Number(matched.orderNumber) : null;
  }, [form.topic, learningItems]);

  const isOrderLockedForTopic = selectedTopicSavedOrder !== null;

  const openConfirmModal = ({ title, message, confirmLabel = "Confirm", onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel,
      onConfirm,
    });
  };

  const closeConfirmModal = () => {
    if (isConfirming) {
      return;
    }

    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      confirmLabel: "Confirm",
      onConfirm: null,
    });
  };

  const openTopicEditor = (group) => {
    setTopicEditor({
      isOpen: true,
      topicId: group.topicId,
      topicName: group.topicName,
      orderNumber: String(group.orderNumber),
    });
  };

  const closeTopicEditor = () => {
    if (isSaving || isConfirming) {
      return;
    }

    setTopicEditor({
      isOpen: false,
      topicId: "",
      topicName: "",
      orderNumber: "",
    });
  };

  const executeConfirmAction = async () => {
    if (!confirmModal.onConfirm) {
      closeConfirmModal();
      return;
    }

    setIsConfirming(true);

    try {
      await confirmModal.onConfirm();
      setConfirmModal({
        isOpen: false,
        title: "",
        message: "",
        confirmLabel: "Confirm",
        onConfirm: null,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    if (!form.topic) {
      setForm((prev) => ({ ...prev, orderNumber: "" }));
      return;
    }

    if (selectedTopicSavedOrder !== null) {
      setForm((prev) => ({ ...prev, orderNumber: String(selectedTopicSavedOrder) }));
      return;
    }

    setForm((prev) => {
      if (prev.orderNumber) {
        return prev;
      }

      return {
        ...prev,
        orderNumber: String(nextGlobalOrderNumber),
      };
    });
  }, [form.topic, selectedTopicSavedOrder, nextGlobalOrderNumber]);

  const currentTheme = useMemo(() => {
    if (theme === "dark") {
      return {
        page: "bg-[#081826] text-slate-100",
        pageAccent: "from-cyan-500/20 via-transparent to-blue-500/10",
        panel: "bg-white/5 border border-white/10 backdrop-blur-xl",
        card: "bg-slate-900/70 border border-slate-700/70",
        input: "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400",
        primary: "bg-cyan-400 hover:bg-cyan-300 text-slate-950",
        danger: "bg-rose-500 hover:bg-rose-400 text-white",
        muted: "bg-slate-800 hover:bg-slate-700 text-slate-100",
        ghost: "bg-white/10 hover:bg-white/20 text-white",
        badgePending: "bg-amber-400 text-slate-950",
        badgeDone: "bg-emerald-400 text-slate-950",
        infoText: "text-slate-300",
      };
    }

    return {
      page: "bg-[#f4fbff] text-slate-900",
      pageAccent: "from-sky-200 via-cyan-100 to-white",
      panel: "bg-white/80 border border-sky-200 backdrop-blur-xl",
      card: "bg-white border border-slate-200",
      input: "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400",
      primary: "bg-sky-600 hover:bg-sky-700 text-white",
      danger: "bg-rose-500 hover:bg-rose-600 text-white",
      muted: "bg-slate-100 hover:bg-slate-200 text-slate-900",
      ghost: "bg-white hover:bg-slate-100 text-slate-900 border border-slate-300",
      badgePending: "bg-amber-500 text-white",
      badgeDone: "bg-emerald-600 text-white",
      infoText: "text-slate-600",
    };
  }, [theme]);

  const loadAllData = async () => {
    setError("");

    try {
      const [topicsData, learningData] = await Promise.all([
        apiRequest("/topics"),
        apiRequest("/learning"),
      ]);

      setTopics(topicsData);
      setLearningItems(learningData);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const addTopic = async () => {
    const name = newTopic.trim();

    if (!name) {
      return;
    }

    setError("");

    try {
      const created = await apiRequest("/topics", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      setTopics((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setForm((prev) => ({ ...prev, topic: created._id }));
      setNewTopic("");
      setIsAddingTopic(false);
    } catch (err) {
      setError(err.message || "Failed to create topic");
    }
  };

  const createLearningItem = async () => {
    setError("");
    setIsSaving(true);

    try {
      const created = await apiRequest("/learning", {
        method: "POST",
        body: JSON.stringify({
          orderNumber: Number(form.orderNumber),
          topic: form.topic,
          subTopic: form.subTopic.trim(),
          description: form.description.trim(),
          status: form.status,
        }),
      });

      const enriched = {
        ...created,
        topic: topics.find((topicItem) => topicItem._id === created.topic) || null,
      };

      setLearningItems((prev) => [...prev, enriched]);
      setForm({
        orderNumber: "",
        topic: "",
        subTopic: "",
        description: "",
        status: "pending",
      });
    } catch (err) {
      setError(err.message || "Failed to create learning item");
    } finally {
      setIsSaving(false);
    }
  };

  const submitHandler = (event) => {
    event.preventDefault();

    if (!form.topic) {
      setError("Please select a topic");
      return;
    }

    if (!form.subTopic.trim()) {
      setError("Sub Topic is required");
      return;
    }

    if (Number(form.orderNumber) <= 0) {
      setError("Order Number must be greater than 0");
      return;
    }

    openConfirmModal({
      title: "Create Learning Card",
      message: "Do you want to create this learning card?",
      confirmLabel: "Create",
      onConfirm: createLearningItem,
    });
  };

  const toggleStatus = async (item) => {
    const nextStatus = item.status === "done" ? "pending" : "done";

    setError("");

    try {
      const updated = await apiRequest(`/learning/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });

      setLearningItems((prev) =>
        prev.map((entry) => {
          if (entry._id !== item._id) {
            return entry;
          }

          return {
            ...entry,
            ...updated,
            topic: entry.topic,
          };
        })
      );
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  const deleteLearningItem = async (id) => {
    setError("");

    try {
      await apiRequest(`/learning/${id}`, {
        method: "DELETE",
      });

      setLearningItems((prev) => prev.filter((entry) => entry._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete learning item");
    }
  };

  const deleteTopic = async (id) => {
    setError("");

    try {
      await apiRequest(`/topics/${id}`, {
        method: "DELETE",
      });

      setTopics((prev) => prev.filter((topic) => topic._id !== id));
      setLearningItems((prev) => prev.filter((entry) => entry.topic?._id !== id));

      if (form.topic === id) {
        setForm((prev) => ({ ...prev, topic: "" }));
      }
    } catch (err) {
      setError(err.message || "Failed to delete topic");
    }
  };

  const updateTopicSettings = async () => {
    const trimmedName = topicEditor.topicName.trim();
    const newOrder = Number(topicEditor.orderNumber);

    if (!trimmedName) {
      setError("Topic name is required");
      return;
    }

    if (!Number.isInteger(newOrder) || newOrder <= 0) {
      setError("Order Number must be a positive integer");
      return;
    }

    const currentGroup = groupedData.find((group) => group.topicId === topicEditor.topicId);

    if (!currentGroup) {
      setError("Topic not found");
      return;
    }

    const isNameChanged = trimmedName !== currentGroup.topicName;
    const isOrderChanged = newOrder !== currentGroup.orderNumber;

    if (!isNameChanged && !isOrderChanged) {
      closeTopicEditor();
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      if (isNameChanged) {
        await apiRequest(`/topics/${topicEditor.topicId}`, {
          method: "PUT",
          body: JSON.stringify({ name: trimmedName }),
        });
      }

      if (isOrderChanged) {
        const realTopics = groupedData.filter(
          (group) => group.topicId !== "unknown" && group.topicId !== topicEditor.topicId
        );

        const hasCollision = realTopics.some((group) => group.orderNumber === newOrder);

        const shiftTargets = hasCollision
          ? realTopics.filter((group) => group.orderNumber >= newOrder)
          : [];

        const reorderRequests = [];

        shiftTargets.forEach((group) => {
          group.items.forEach((item) => {
            reorderRequests.push(
              apiRequest(`/learning/${item._id}`, {
                method: "PUT",
                body: JSON.stringify({
                  orderNumber: Number(item.orderNumber) + 1,
                }),
              })
            );
          });
        });

        currentGroup.items.forEach((item) => {
          reorderRequests.push(
            apiRequest(`/learning/${item._id}`, {
              method: "PUT",
              body: JSON.stringify({
                orderNumber: newOrder,
              }),
            })
          );
        });

        await Promise.all(reorderRequests);
      }

      await loadAllData();
      closeTopicEditor();
    } catch (err) {
      setError(err.message || "Failed to update topic settings");
    } finally {
      setIsSaving(false);
    }
  };

  const groupedData = useMemo(() => {
    const grouped = {};

    learningItems.forEach((item) => {
      const topicId = item.topic?._id || "unknown";
      const topicName = item.topic?.name || "Unknown Topic";
      const orderNumber = Number(item.orderNumber) || 0;

      if (!grouped[topicId]) {
        grouped[topicId] = {
          topicId,
          topicName,
          orderNumber,
          items: [],
        };
      }

      grouped[topicId].items.push(item);
      grouped[topicId].orderNumber = Math.min(grouped[topicId].orderNumber, orderNumber);
    });

    Object.values(grouped).forEach((group) => {
      group.items.sort((a, b) => {
        const subTopicA = (a.subTopic || "").trim();
        const subTopicB = (b.subTopic || "").trim();
        return alphaSorter.compare(subTopicA, subTopicB);
      });
    });

    return Object.values(grouped).sort((a, b) => {
      if (a.orderNumber !== b.orderNumber) {
        return a.orderNumber - b.orderNumber;
      }

      return a.topicName.localeCompare(b.topicName);
    });
  }, [learningItems]);

  const orderedTopicList = useMemo(
    () => groupedData.filter((group) => group.topicId !== "unknown"),
    [groupedData]
  );

  const totalDone = useMemo(
    () => learningItems.filter((item) => item.status === "done").length,
    [learningItems]
  );

  const totalPending = learningItems.length - totalDone;

  return (
    <div className={`relative min-h-screen overflow-hidden transition-all duration-300 ${currentTheme.page}`}>
      <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${currentTheme.pageAccent}`} />

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}
      <div className="flex justify-center items-start flex-wrap lg:flex-nowrap gap-4  mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={`mb-8 rounded-3xl p-6 shadow-xl ${currentTheme.panel}`}>
          <div className="min-h-[20vh] flex flex-wrap items-start  gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-500">Learning Manager</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">SaaS Learning Dashboard</h1>
              <p className={`mt-2 text-sm ${currentTheme.infoText}`}>
                Track your topics with clean workflow, confirmations, and progress visibility.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${currentTheme.ghost}`}
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className={`${currentTheme.card} rounded-2xl p-4`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${currentTheme.infoText}`}>Topics</p>
              <p className="mt-2 text-3xl font-bold">{groupedData.length}</p>
            </div>
            <div className={`${currentTheme.card} rounded-2xl p-4`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${currentTheme.infoText}`}>Done</p>
              <p className="mt-2 text-3xl font-bold">{totalDone}</p>
            </div>
            <div className={`${currentTheme.card} rounded-2xl p-4`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${currentTheme.infoText}`}>Pending</p>
              <p className="mt-2 text-3xl font-bold">{totalPending}</p>
            </div>
          </div>
        </div>



        <div className={`mb-8 rounded-3xl p-6 shadow-xl ${currentTheme.panel}`}>
          <h2 className="text-2xl font-bold">Create Learning Card</h2>
          <p className={`mt-1 text-sm ${currentTheme.infoText}`}>Add topic or card details with guided numbering.</p>

          <form onSubmit={submitHandler} className="mt-6 flex flex-col justify-center gap-2 ">

            <input
              type="number"
              min="1"
              placeholder="Order Number"
              value={form.orderNumber}
              onChange={(event) => setForm({ ...form, orderNumber: event.target.value })}
              readOnly={isOrderLockedForTopic}
              className={`w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 ${currentTheme.input}`}
            />

            <div className="flex justify-center items-center gap-2">
              <select
                value={form.topic}
                onChange={(event) => setForm({ ...form, topic: event.target.value })}
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 ${currentTheme.input}`}
              >
                <option value="">Select Topic</option>
                {topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>
                    {topic.name}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 lg:col-span-2">
                {!isAddingTopic ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingTopic(true)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${currentTheme.primary}`}
                  >
                    <IconPlus />
                  </button>
                ) : (
                  <>
                    <input
                      value={newTopic}
                      onChange={(event) => setNewTopic(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addTopic();
                        }
                      }}
                      placeholder="Enter topic name"
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 ${currentTheme.input}`}
                    />
                    <button
                      type="button"
                      onClick={addTopic}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${currentTheme.primary}`}
                    >
                      <IconPlus />
                      Save Topic
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTopic(false);
                        setNewTopic("");
                      }}
                      className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${currentTheme.muted}`}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

            </div>



            <input
              placeholder="Sub Topic"
              value={form.subTopic}
              onChange={(event) => setForm({ ...form, subTopic: event.target.value })}
              className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 ${currentTheme.input}`}
            />

            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 ${currentTheme.input}`}
            >
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>

            <textarea
              rows="4"
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className={`lg:col-span-2 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 ${currentTheme.input}`}
            />

            <button
              disabled={isSaving}
              className={`lg:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${currentTheme.primary}`}
            >
              <IconCheck />
              {isSaving ? "Saving..." : "Save Learning Card"}
            </button>
          </form>
        </div>


      </div>

      <div className="lg:p-12 space-y-8">
        {loading ? <p className={currentTheme.infoText}>Loading data...</p> : null}

        {!loading && groupedData.length === 0 ? (
          <div className={`${currentTheme.panel} rounded-3xl p-6`}>
            <p className={currentTheme.infoText}>No learning cards yet. Add your first one from the form above.</p>
          </div>
        ) : null}

        {groupedData.map((group) => {
          const { topicName, items, topicId, orderNumber } = group;

          return (
            <section key={topicId} className={`${currentTheme.panel} rounded-3xl p-6 shadow-lg`}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-black sm:text-3xl">
                  {orderNumber}. {topicName}
                </h2>

                {topicId !== "unknown" ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openTopicEditor(group)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition border-2 border-white/30 ${currentTheme.muted}`}
                    >
                      <IconEdit />
                      Manage Topic
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openConfirmModal({
                          title: "Delete Topic",
                          message: `Delete ${topicName} and all related cards? This cannot be undone.`,
                          confirmLabel: "Delete Topic",
                          onConfirm: () => deleteTopic(topicId),
                        })
                      }
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${currentTheme.danger}`}
                    >
                      <IconTrash />
                      Delete Topic
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <article
                    key={item._id}
                    className={`${currentTheme.card} rounded-2xl p-4 shadow-sm transition-all duration-300 ${item.status === "done"
                      ? "bg-black border border-blue-300/20 backdrop-blur-2xl shadow-black"
                      : ""
                      }`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <label className="flex flex-1 cursor-pointer items-start gap-4">
                        <input
                          type="checkbox"
                          checked={item.status === "done"}
                          onChange={() =>
                            openConfirmModal({
                              title: "Update Status",
                              message: `Change status for ${item.subTopic}?`,
                              confirmLabel: "Update",
                              onConfirm: () => toggleStatus(item),
                            })
                          }
                          className="mt-1 h-5 w-5 rounded border-slate-400 text-cyan-500 focus:ring-2 focus:ring-cyan-400"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={`text-lg font-bold ${item.status === "done" ? "text-cyan-100" : ""}`}>
                              {item.subTopic}
                            </h3>


                          </div>

                          {item.description ? (
                            <p
                              className={`mt-2 text-sm leading-relaxed ${currentTheme.infoText} ${item.status === "done" ? "text-blue-100 opacity-90" : ""
                                }`}
                            >
                              {item.description}
                            </p>
                          ) : (
                            <p className={`mt-2 text-sm italic ${currentTheme.infoText}`}>No description</p>
                          )}


                        </div>
                      </label>

                      <div className="flex flex-wrap gap-2 md:justify-end">


                        <button
                          type="button"
                          onClick={() =>
                            openConfirmModal({
                              title: "Delete Card",
                              message: `Delete ${item.subTopic}? This cannot be undone.`,
                              confirmLabel: "Delete",
                              onConfirm: () => deleteLearningItem(item._id),
                            })
                          }
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${currentTheme.danger}`}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {confirmModal.isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/70 p-4 backdrop-blur-sm">
          <div className={`${currentTheme.card} w-full max-w-md rounded-2xl p-6 shadow-2xl`}>
            <h3 className="text-2xl font-bold">{confirmModal.title}</h3>
            <p className={`mt-3 text-sm ${currentTheme.infoText}`}>{confirmModal.message}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={isConfirming || isSaving}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${currentTheme.muted}`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeConfirmAction}
                disabled={isConfirming || isSaving}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${currentTheme.primary}`}
              >
                <IconCheck />
                {isConfirming || isSaving ? "Please wait..." : confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {topicEditor.isOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
          <div className={`${currentTheme.card} w-full max-w-lg rounded-2xl p-6 shadow-2xl`}>
            <h3 className="text-2xl font-bold">Manage Topic</h3>
            <p className={`mt-2 text-sm ${currentTheme.infoText}`}>
              Edit topic heading and order number from one place.
            </p>

            <div className={`mt-4 rounded-xl border p-3 ${currentTheme.panel}`}>
              <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.14em] ${currentTheme.infoText}`}>
                Current Topic Order
              </p>

              <div className="max-h-40 overflow-y-auto pr-1">
                {orderedTopicList.map((topic) => (
                  <p key={topic.topicId} className={`text-sm ${currentTheme.infoText}`}>
                    {topic.orderNumber}. {topic.topicName}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className={`mb-2 block text-sm font-semibold ${currentTheme.infoText}`}>Topic Name</label>
                <input
                  value={topicEditor.topicName}
                  onChange={(event) =>
                    setTopicEditor((prev) => ({
                      ...prev,
                      topicName: event.target.value,
                    }))
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 ${currentTheme.input}`}
                />
              </div>

              <div>
                <label className={`mb-2 block text-sm font-semibold ${currentTheme.infoText}`}>Order Number</label>
                <input
                  type="number"
                  min="1"
                  value={topicEditor.orderNumber}
                  onChange={(event) =>
                    setTopicEditor((prev) => ({
                      ...prev,
                      orderNumber: event.target.value,
                    }))
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 ${currentTheme.input}`}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeTopicEditor}
                disabled={isSaving || isConfirming}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${currentTheme.muted}`}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSaving || isConfirming}
                onClick={() =>
                  openConfirmModal({
                    title: "Update Topic",
                    message:
                      "Apply these changes? If order number collides, existing topics at that number and above will shift by +1. If target order is empty, no shifting will happen.",
                    confirmLabel: "Update Topic",
                    onConfirm: updateTopicSettings,
                  })
                }
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${currentTheme.primary}`}
              >
                <IconCheck />
                Update
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;