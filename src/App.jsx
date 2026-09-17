import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, Receipt, PieChart as PieIcon, Settings, Search, Bell,
  Wallet, TrendingUp, TrendingDown, Plus, Trash2, X, RotateCcw,
  Utensils, Car, Zap, ShoppingBag, HeartPulse, Film, BookOpen, Home as HomeIcon,
  MoreHorizontal, Gift, Banknote, CalendarClock, ChevronDown, Download,
  Target, Coins, AlertTriangle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";

// ---------- Design tokens ----------
const COLORS = {
  bg: "#F3F1FB",
  card: "#FFFFFF",
  ink: "#1E1B3A",
  sub: "#6F6B92",
  line: "#E7E4F5",
  primary: "#5B4FE9",
  primaryDark: "#4338CA",
  primarySoft: "#EDEBFC",
  income: "#0EA37A",
  incomeSoft: "#E3F9F1",
  expense: "#E4476C",
  expenseSoft: "#FDEAEF",
  gold: "#DDA53B",
};

const EXPENSE_CATEGORIES = [
  { id: "makanan", label: "Makanan & Minuman", icon: Utensils, color: "#E4476C" },
  { id: "transportasi", label: "Transportasi", icon: Car, color: "#3B82F6" },
  { id: "tagihan", label: "Tagihan & Utilitas", icon: Zap, color: "#DDA53B" },
  { id: "belanja", label: "Belanja Kebutuhan", icon: ShoppingBag, color: "#8B5CF6" },
  { id: "kesehatan", label: "Kesehatan", icon: HeartPulse, color: "#EF4444" },
  { id: "hiburan", label: "Hiburan", icon: Film, color: "#EC4899" },
  { id: "pendidikan", label: "Pendidikan", icon: BookOpen, color: "#0EA5E9" },
  { id: "rumah", label: "Sewa / Rumah", icon: HomeIcon, color: "#14B8A6" },
  { id: "lain", label: "Lain-lain", icon: MoreHorizontal, color: "#6B7280" },
];

const INCOME_CATEGORIES = [
  { id: "gaji", label: "Gaji Bulanan", icon: Banknote, color: "#0EA37A" },
  { id: "bonus", label: "Bonus / Tunjangan", icon: Gift, color: "#22C55E" },
  { id: "lain_masuk", label: "Pemasukan Lain", icon: MoreHorizontal, color: "#059669" },
];

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

const DEFAULT_BUDGETS = {
  makanan: 300,
  transportasi: 100,
  tagihan: 150,
  belanja: 100,
  kesehatan: 80,
  hiburan: 60,
  pendidikan: 150,
  rumah: 650,
  lain: 50,
};

function fmtRM(n) {
  const v = Number(n) || 0;
  return "RM " + v.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function monthLabel(ym) {
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

// ---------- Seed data ----------
const seedTx = [
  { id: 1, type: "income", category: "gaji", amount: 1768.5, date: "2026-06-16", note: "Gaji bulan Juni" },
  { id: 2, type: "expense", category: "rumah", amount: 650, date: "2026-06-16", note: "Sewa kamar" },
  { id: 3, type: "expense", category: "makanan", amount: 42.5, date: "2026-06-18", note: "Belanja dapur" },
  { id: 4, type: "expense", category: "transportasi", amount: 30, date: "2026-06-19", note: "Bensin" },
  { id: 5, type: "expense", category: "tagihan", amount: 85.9, date: "2026-06-20", note: "Listrik & air" },
  { id: 6, type: "income", category: "lain_masuk", amount: 120, date: "2026-06-22", note: "Jual barang lama" },
  { id: 7, type: "expense", category: "hiburan", amount: 25, date: "2026-06-25", note: "Nonton bioskop" },
  { id: 8, type: "income", category: "gaji", amount: 1768.5, date: "2026-07-17", note: "Gaji bulan Juli" },
  { id: 9, type: "expense", category: "rumah", amount: 650, date: "2026-07-17", note: "Sewa kamar" },
  { id: 10, type: "expense", category: "makanan", amount: 38, date: "2026-07-19", note: "Belanja dapur" },
  { id: 11, type: "expense", category: "kesehatan", amount: 60, date: "2026-07-21", note: "Obat & apotek" },
  { id: 12, type: "expense", category: "belanja", amount: 95, date: "2026-07-22", note: "Kebutuhan rumah" },
  { id: 13, type: "expense", category: "transportasi", amount: 28, date: "2026-07-23", note: "Bensin" },
];

function catInfo(id) {
  return ALL_CATEGORIES.find((c) => c.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

export default function App() {
  const [tx, setTx] = useState(seedTx);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [tab, setTab] = useState("ringkasan");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("expense");
  const [search, setSearch] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [savingsGoal, setSavingsGoal] = useState({ name: "Laptop Baru", target: 3000, saved: 350 });
  const [showGoalForm, setShowGoalForm] = useState(false);

  const [form, setForm] = useState({
    category: "makanan",
    amount: "",
    date: todayISO(),
    note: "",
  });

  const sorted = useMemo(
    () => [...tx].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [tx]
  );

  const totalIncome = useMemo(
    () => tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [tx]
  );
  const totalExpense = useMemo(
    () => tx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [tx]
  );
  const balance = totalIncome - totalExpense;

  // status gaji
  const now = new Date();
  const dayOfMonth = now.getDate();
  const salaryDue = dayOfMonth < 15 ? 15 - dayOfMonth : dayOfMonth > 18 ? null : 0;
  const salaryPaidThisWindow = tx.some((t) => {
    if (t.type !== "income" || t.category !== "gaji") return false;
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // hitung "uang aman per hari" sampai jadwal gaji berikutnya (tgl 15-18)
  const dailyAllowance = useMemo(() => {
    const today = new Date();
    let target;
    if (dayOfMonth < 15) {
      target = new Date(today.getFullYear(), today.getMonth(), 15);
    } else if (dayOfMonth > 18) {
      target = new Date(today.getFullYear(), today.getMonth() + 1, 15);
    } else {
      target = null; // sedang dalam periode gajian, tidak perlu hitung
    }
    if (!target) return null;
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.max(1, Math.ceil((target - today) / msPerDay));
    return { daysLeft, perDay: balance > 0 ? balance / daysLeft : 0 };
  }, [dayOfMonth, balance]);

  // tren saldo 14 hari terakhir
  const trendData = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayIncome = tx.filter((t) => t.date === iso && t.type === "income").reduce((s, t) => s + t.amount, 0);
      const dayExpense = tx.filter((t) => t.date === iso && t.type === "expense").reduce((s, t) => s + t.amount, 0);
      days.push({
        label: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        Pemasukan: dayIncome,
        Pengeluaran: dayExpense,
      });
    }
    return days;
  }, [tx]);

  // bulan yang tersedia
  const months = useMemo(() => {
    const set = new Set(tx.map((t) => t.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [tx]);
  const [selectedMonth, setSelectedMonth] = useState(months[0] || todayISO().slice(0, 7));

  const monthTx = useMemo(
    () => tx.filter((t) => t.date.slice(0, 7) === selectedMonth),
    [tx, selectedMonth]
  );
  const monthIncome = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    monthTx
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([id, amount]) => ({ ...catInfo(id), amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTx]);

  const filteredList = sorted.filter((t) => {
    const c = catInfo(t.category);
    const q = search.toLowerCase();
    return (
      c.label.toLowerCase().includes(q) ||
      (t.note || "").toLowerCase().includes(q)
    );
  });

  function openForm(type) {
    setFormType(type);
    setForm({
      category: type === "income" ? "gaji" : "makanan",
      amount: "",
      date: todayISO(),
      note: "",
    });
    setShowForm(true);
  }

  function submitForm(e) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return;
    setTx((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: formType,
        category: form.category,
        amount: amt,
        date: form.date,
        note: form.note,
      },
    ]);
    setShowForm(false);
  }

  function quickAddSalary() {
    setTx((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "income",
        category: "gaji",
        amount: 1768.5,
        date: todayISO(),
        note: "Gaji bulanan (tetap)",
      },
    ]);
  }

  function deleteTx(id) {
    setTx((prev) => prev.filter((t) => t.id !== id));
  }

  function exportCSV() {
    const header = "Tanggal,Tipe,Kategori,Jumlah (RM),Catatan\n";
    const rows = sorted
      .map((t) => {
        const c = catInfo(t.category);
        const tipe = t.type === "income" ? "Pemasukan" : "Pengeluaran";
        const note = (t.note || "").replace(/,/g, ";");
        return `${t.date},${tipe},${c.label},${t.amount.toFixed(2)},${note}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transaksi_keuangan.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function updateBudget(catId, value) {
    setBudgets((prev) => ({ ...prev, [catId]: value }));
  }

  function resetAllData() {
    setTx([]);
    setSelectedMonth(todayISO().slice(0, 7));
    setSearch("");
    setShowResetConfirm(false);
  }

  const categoryOptions = formType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui", background: COLORS.bg, minHeight: "100%", color: COLORS.ink, display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        button { font-family: inherit; cursor: pointer; }
        input, select { font-family: inherit; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #D9D5F0; border-radius: 8px; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: 232, background: COLORS.card, borderRight: `1px solid ${COLORS.line}`, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 20px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wallet size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: -0.3 }}>Duit<span style={{ color: COLORS.primary }}>Ku</span></span>
        </div>

        <NavItem icon={LayoutDashboard} label="Dashboard" active={activeNav === "dashboard"} onClick={() => setActiveNav("dashboard")} />
        <NavItem icon={Receipt} label="Transaksi" active={activeNav === "transaksi"} onClick={() => { setActiveNav("transaksi"); setTab("transaksi"); }} />
        <NavItem icon={PieIcon} label="Laporan Bulanan" active={activeNav === "laporan"} onClick={() => { setActiveNav("laporan"); setTab("laporan"); }} />
        <div style={{ height: 1, background: COLORS.line, margin: "12px 8px" }} />
        <NavItem icon={Settings} label="Pengaturan" active={activeNav === "pengaturan"} onClick={() => setActiveNav("pengaturan")} />

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: COLORS.primarySoft, borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <CalendarClock size={16} color={COLORS.primaryDark} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.primaryDark }}>Gaji Bulanan</span>
            </div>
            <p style={{ fontSize: 11.5, color: COLORS.sub, margin: "0 0 8px", lineHeight: 1.5 }}>
              Masuk setiap tanggal <b>15–18</b>, tetap <b>RM 1.768,50</b>.
            </p>
            <button onClick={quickAddSalary} style={{ width: "100%", border: "none", background: COLORS.primary, color: "#fff", fontSize: 12, fontWeight: 700, padding: "8px 10px", borderRadius: 9 }}>
              + Catat Gaji Hari Ini
            </button>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", border: `1px solid ${COLORS.line}`, background: "#fff", color: COLORS.expense, fontSize: 12.5, fontWeight: 700, padding: "10px 10px", borderRadius: 10 }}
          >
            <RotateCcw size={14} /> Reset Data
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: "22px 28px", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
          <div style={{ flex: 1, maxWidth: 420, display: "flex", alignItems: "center", gap: 8, background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "10px 14px" }}>
            <Search size={16} color={COLORS.sub} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari transaksi..." style={{ border: "none", outline: "none", fontSize: 13.5, width: "100%", background: "transparent" }} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 36, height: 36, borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={16} color={COLORS.sub} />
              <span style={{ position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: 99, background: COLORS.expense }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,#7C6BF0,${COLORS.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>F</div>
              <span style={{ fontWeight: 700, fontSize: 13.5 }}>Fahrul</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <TabButton label="Ringkasan" active={tab === "ringkasan"} onClick={() => setTab("ringkasan")} />
          <TabButton label="Catat Transaksi" active={tab === "transaksi"} onClick={() => setTab("transaksi")} />
          <TabButton label="Laporan Bulanan" active={tab === "laporan"} onClick={() => setTab("laporan")} />
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button onClick={() => openForm("income")} style={pillBtn(COLORS.income)}>
              <Plus size={14} /> Pemasukan
            </button>
            <button onClick={() => openForm("expense")} style={pillBtn(COLORS.expense)}>
              <Plus size={14} /> Pengeluaran
            </button>
          </div>
        </div>

        {/* Salary banner */}
        {salaryDue !== null && !salaryPaidThisWindow && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, borderLeft: `4px solid ${COLORS.gold}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarClock size={18} color={COLORS.gold} />
            <span style={{ fontSize: 13.5 }}>
              {salaryDue === 0
                ? <>Periode gaji tanggal <b>15–18</b> sedang berlangsung — jangan lupa catat penerimaan <b>RM 1.768,50</b>.</>
                : <>Gaji <b>RM 1.768,50</b> diperkirakan masuk dalam <b>{salaryDue} hari</b> lagi (antara tanggal 15–18).</>}
            </span>
          </div>
        )}

        {tab === "ringkasan" && (
          <RingkasanTab
            balance={balance}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            trendData={trendData}
            recent={sorted.slice(0, 5)}
            dailyAllowance={dailyAllowance}
            savingsGoal={savingsGoal}
            onEditGoal={() => setShowGoalForm(true)}
          />
        )}

        {tab === "transaksi" && (
          <TransaksiTab list={filteredList} onDelete={deleteTx} onExport={exportCSV} />
        )}

        {tab === "laporan" && (
          <LaporanTab
            months={months}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            monthIncome={monthIncome}
            monthExpense={monthExpense}
            categoryBreakdown={categoryBreakdown}
            monthTx={monthTx}
            budgets={budgets}
            onUpdateBudget={updateBudget}
          />
        )}
      </main>

      {/* FORM MODAL */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(30,27,58,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <form onSubmit={submitForm} style={{ background: "#fff", borderRadius: 18, padding: 24, width: 380, boxShadow: "0 20px 50px rgba(30,27,58,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
                {formType === "income" ? "Catat Pemasukan" : "Catat Pengeluaran"}
              </h3>
              <button type="button" onClick={() => setShowForm(false)} style={{ border: "none", background: COLORS.primarySoft, borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={15} />
              </button>
            </div>

            <label style={labelStyle}>Kategori</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
              {categoryOptions.map((c) => {
                const Icon = c.icon;
                const active = form.category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                      padding: "10px 4px", borderRadius: 10, border: `1.5px solid ${active ? c.color : COLORS.line}`,
                      background: active ? c.color + "1A" : "#fff",
                    }}
                  >
                    <Icon size={16} color={c.color} />
                    <span style={{ fontSize: 10.5, textAlign: "center", lineHeight: 1.2, color: COLORS.ink, fontWeight: 600 }}>{c.label}</span>
                  </button>
                );
              })}
            </div>

            <label style={labelStyle}>Jumlah (RM)</label>
            <input
              required
              type="number" step="0.01" min="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              style={inputStyle}
            />

            <label style={labelStyle}>Tanggal</label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              style={inputStyle}
            />

            <label style={labelStyle}>Catatan (opsional)</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="cth: makan siang"
              style={{ ...inputStyle, marginBottom: 20 }}
            />

            <button type="submit" style={{ width: "100%", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14, color: "#fff", background: formType === "income" ? COLORS.income : COLORS.expense }}>
              Simpan {formType === "income" ? "Pemasukan" : "Pengeluaran"}
            </button>
          </form>
        </div>
      )}

      {/* SAVINGS GOAL MODAL */}
      {showGoalForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(30,27,58,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 55 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowGoalForm(false);
            }}
            style={{ background: "#fff", borderRadius: 18, padding: 24, width: 360, boxShadow: "0 20px 50px rgba(30,27,58,0.25)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Target Tabungan</h3>
              <button type="button" onClick={() => setShowGoalForm(false)} style={{ border: "none", background: COLORS.primarySoft, borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={15} />
              </button>
            </div>
            <label style={labelStyle}>Nama Target</label>
            <input
              type="text"
              value={savingsGoal.name}
              onChange={(e) => setSavingsGoal((g) => ({ ...g, name: e.target.value }))}
              placeholder="cth: Laptop Baru"
              style={inputStyle}
            />
            <label style={labelStyle}>Target Jumlah (RM)</label>
            <input
              type="number" step="0.01" min="0"
              value={savingsGoal.target}
              onChange={(e) => setSavingsGoal((g) => ({ ...g, target: parseFloat(e.target.value) || 0 }))}
              style={inputStyle}
            />
            <label style={labelStyle}>Sudah Ditabung (RM)</label>
            <input
              type="number" step="0.01" min="0"
              value={savingsGoal.saved}
              onChange={(e) => setSavingsGoal((g) => ({ ...g, saved: parseFloat(e.target.value) || 0 }))}
              style={{ ...inputStyle, marginBottom: 20 }}
            />
            <button type="submit" style={{ width: "100%", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14, color: "#fff", background: COLORS.primary }}>
              Simpan Target
            </button>
          </form>
        </div>
      )}

      {/* RESET CONFIRM MODAL */}
      {showResetConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(30,27,58,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, width: 340, boxShadow: "0 20px 50px rgba(30,27,58,0.25)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.expenseSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <RotateCcw size={18} color={COLORS.expense} />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800 }}>Reset semua data?</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: COLORS.sub, lineHeight: 1.5 }}>
              Semua transaksi pemasukan dan pengeluaran yang tercatat akan dihapus dan tidak dapat dikembalikan.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{ flex: 1, border: `1px solid ${COLORS.line}`, background: "#fff", color: COLORS.ink, fontWeight: 700, fontSize: 13, padding: "10px", borderRadius: 10 }}
              >
                Batal
              </button>
              <button
                onClick={resetAllData}
                style={{ flex: 1, border: "none", background: COLORS.expense, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px", borderRadius: 10 }}
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Sub components ----------

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
      border: "none", background: active ? COLORS.primary : "transparent",
      color: active ? "#fff" : COLORS.sub, fontWeight: 600, fontSize: 13.5, textAlign: "left",
    }}>
      <Icon size={17} />
      {label}
    </button>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 16px", borderRadius: 10, border: `1px solid ${active ? COLORS.primary : COLORS.line}`,
      background: active ? COLORS.primary : COLORS.card, color: active ? "#fff" : COLORS.ink,
      fontWeight: 700, fontSize: 13,
    }}>
      {label}
    </button>
  );
}

function pillBtn(color) {
  return {
    display: "flex", alignItems: "center", gap: 6, border: "none", borderRadius: 10,
    padding: "9px 14px", background: color, color: "#fff", fontWeight: 700, fontSize: 12.5,
  };
}

const labelStyle = { fontSize: 11.5, fontWeight: 700, color: COLORS.sub, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.line}`, fontSize: 13.5, marginBottom: 14, outline: "none" };

function StatCard({ icon: Icon, label, value, tint, sub }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.line}`, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: tint + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={tint} />
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: COLORS.sub, margin: "0 0 4px", fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: "'Space Mono', monospace" }}>{value}</p>
      {sub && <p style={{ fontSize: 11.5, color: COLORS.sub, margin: "6px 0 0" }}>{sub}</p>}
    </div>
  );
}

function RingkasanTab({ balance, totalIncome, totalExpense, trendData, recent, dailyAllowance, savingsGoal, onEditGoal }) {
  const goalPct = savingsGoal.target > 0 ? Math.min(100, (savingsGoal.saved / savingsGoal.target) * 100) : 0;

  return (
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
        <StatCard icon={Wallet} label="Saldo Saat Ini" value={fmtRM(balance)} tint={COLORS.primary} />
        <StatCard icon={TrendingUp} label="Total Pemasukan" value={fmtRM(totalIncome)} tint={COLORS.income} />
        <StatCard icon={TrendingDown} label="Total Pengeluaran" value={fmtRM(totalExpense)} tint={COLORS.expense} />
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
        <div style={{ flex: 1, background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Coins size={17} color={COLORS.gold} />
            <span style={{ fontSize: 13, fontWeight: 800 }}>Uang Aman per Hari</span>
          </div>
          {dailyAllowance ? (
            <>
              <p style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", fontFamily: "'Space Mono', monospace", color: dailyAllowance.perDay < 10 ? COLORS.expense : COLORS.ink }}>
                {fmtRM(dailyAllowance.perDay)} <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.sub }}>/ hari</span>
              </p>
              <p style={{ fontSize: 11.5, color: COLORS.sub, margin: 0 }}>
                Berdasarkan saldo saat ini dibagi <b>{dailyAllowance.daysLeft} hari</b> sampai gajian berikutnya (tgl 15–18).
              </p>
              {dailyAllowance.perDay < 10 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: COLORS.expense, fontSize: 11.5, fontWeight: 700 }}>
                  <AlertTriangle size={13} /> Sisa saldo cukup tipis, coba hemat pengeluaran.
                </div>
              )}
            </>
          ) : (
            <p style={{ fontSize: 12.5, color: COLORS.sub, margin: 0 }}>Sedang dalam periode gajian (tgl 15–18), kalkulator akan aktif lagi setelahnya.</p>
          )}
        </div>

        <div style={{ flex: 1, background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.line}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={17} color={COLORS.primary} />
              <span style={{ fontSize: 13, fontWeight: 800 }}>Target Tabungan: {savingsGoal.name}</span>
            </div>
            <button onClick={onEditGoal} style={{ border: "none", background: "transparent", color: COLORS.primary, fontSize: 11.5, fontWeight: 700 }}>Edit</button>
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px", fontFamily: "'Space Mono', monospace" }}>
            {fmtRM(savingsGoal.saved)} <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.sub }}>/ {fmtRM(savingsGoal.target)}</span>
          </p>
          <div style={{ height: 8, borderRadius: 5, background: COLORS.line, marginBottom: 6 }}>
            <div style={{ height: "100%", width: `${goalPct}%`, borderRadius: 5, background: COLORS.primary }} />
          </div>
          <p style={{ fontSize: 11.5, color: COLORS.sub, margin: 0 }}>{goalPct.toFixed(0)}% tercapai</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
        <div style={{ flex: 2, background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.line}`, padding: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800 }}>Arus Kas (14 hari terakhir)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.income} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.income} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.expense} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.expense} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.sub }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: COLORS.sub }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmtRM(v)} contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.line}`, fontSize: 12 }} />
              <Area type="monotone" dataKey="Pemasukan" stroke={COLORS.income} fill="url(#inc)" strokeWidth={2} />
              <Area type="monotone" dataKey="Pengeluaran" stroke={COLORS.expense} fill="url(#exp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.line}`, padding: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800 }}>Transaksi Terbaru</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recent.length === 0 && <p style={{ color: COLORS.sub, fontSize: 13 }}>Belum ada transaksi.</p>}
            {recent.map((t) => {
              const c = catInfo(t.category);
              const Icon = c.icon;
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: c.color + "1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={15} color={c.color} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: COLORS.sub }}>{t.date}</p>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: t.type === "income" ? COLORS.income : COLORS.expense, fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>
                    {t.type === "income" ? "+" : "-"}{fmtRM(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function TransaksiTab({ list, onDelete, onExport }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.line}`, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "12px 20px", borderBottom: `1px solid ${COLORS.line}` }}>
        <button onClick={onExport} style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${COLORS.line}`, background: "#fff", color: COLORS.ink, fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 9 }}>
          <Download size={14} /> Export CSV
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1.2fr 1fr 1.6fr 0.6fr", padding: "13px 20px", background: "#FAFAFE", borderBottom: `1px solid ${COLORS.line}` }}>
        {["Kategori", "Jumlah", "Tanggal", "Catatan", ""].map((h) => (
          <span key={h} style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.sub, textTransform: "uppercase", letterSpacing: 0.3 }}>{h}</span>
        ))}
      </div>
      <div>
        {list.length === 0 && (
          <p style={{ padding: 30, textAlign: "center", color: COLORS.sub, fontSize: 13 }}>Tidak ada transaksi ditemukan.</p>
        )}
        {list.map((t) => {
          const c = catInfo(t.category);
          const Icon = c.icon;
          return (
            <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2.2fr 1.2fr 1fr 1.6fr 0.6fr", padding: "13px 20px", alignItems: "center", borderBottom: `1px solid ${COLORS.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: c.color + "1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={15} color={c.color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: t.type === "income" ? COLORS.income : COLORS.expense, fontFamily: "'Space Mono', monospace" }}>
                {t.type === "income" ? "+" : "-"}{fmtRM(t.amount)}
              </span>
              <span style={{ fontSize: 12.5, color: COLORS.sub }}>{t.date}</span>
              <span style={{ fontSize: 12.5, color: COLORS.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.note || "—"}</span>
              <button onClick={() => onDelete(t.id)} style={{ border: "none", background: "transparent", color: COLORS.expense, justifySelf: "start" }}>
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LaporanTab({ months, selectedMonth, setSelectedMonth, monthIncome, monthExpense, categoryBreakdown, budgets, onUpdateBudget }) {
  const netSavings = monthIncome - monthExpense;
  const chartData = categoryBreakdown.map((c) => ({ name: c.label, Jumlah: c.amount, fill: c.color }));
  const spentByCat = Object.fromEntries(categoryBreakdown.map((c) => [c.id, c.amount]));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Laporan untuk {monthLabel(selectedMonth)}</h3>
        {months.length > 0 && (
          <div style={{ position: "relative" }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ appearance: "none", padding: "8px 30px 8px 12px", borderRadius: 9, border: `1px solid ${COLORS.line}`, fontSize: 12.5, fontWeight: 700, background: "#fff" }}
            >
              {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: 10, top: 10, pointerEvents: "none", color: COLORS.sub }} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
        <StatCard icon={TrendingUp} label="Pemasukan Bulan Ini" value={fmtRM(monthIncome)} tint={COLORS.income} />
        <StatCard icon={TrendingDown} label="Pengeluaran Bulan Ini" value={fmtRM(monthExpense)} tint={COLORS.expense} />
        <StatCard
          icon={Wallet}
          label="Saldo Bersih (Tabungan)"
          value={fmtRM(netSavings)}
          tint={netSavings >= 0 ? COLORS.primary : COLORS.expense}
          sub={monthIncome > 0 ? `${((netSavings / monthIncome) * 100).toFixed(0)}% dari pemasukan` : undefined}
        />
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1.3, background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.line}`, padding: 20 }}>
          <h4 style={{ margin: "0 0 14px", fontSize: 14.5, fontWeight: 800 }}>Rincian Pengeluaran per Kategori</h4>
          {chartData.length === 0 ? (
            <p style={{ color: COLORS.sub, fontSize: 13 }}>Belum ada pengeluaran tercatat bulan ini.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke={COLORS.line} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.sub }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11.5, fill: COLORS.ink }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fmtRM(v)} contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.line}`, fontSize: 12 }} />
                <Bar dataKey="Jumlah" radius={[0, 6, 6, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ flex: 1, background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.line}`, padding: 20 }}>
          <h4 style={{ margin: "0 0 14px", fontSize: 14.5, fontWeight: 800 }}>Daftar Kategori</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 260, overflowY: "auto" }}>
            {categoryBreakdown.map((c) => {
              const Icon = c.icon;
              const pct = monthExpense > 0 ? (c.amount / monthExpense) * 100 : 0;
              return (
                <div key={c.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Icon size={14} color={c.color} />
                    <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{c.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Space Mono', monospace" }}>{fmtRM(c.amount)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: COLORS.line }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: c.color }} />
                  </div>
                </div>
              );
            })}
            {categoryBreakdown.length === 0 && <p style={{ color: COLORS.sub, fontSize: 13 }}>—</p>}
          </div>
        </div>
      </div>

      <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.line}`, padding: 20, marginTop: 16 }}>
        <h4 style={{ margin: "0 0 4px", fontSize: 14.5, fontWeight: 800 }}>Anggaran Bulanan per Kategori</h4>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: COLORS.sub }}>Atur batas pengeluaran per kategori supaya lebih terkontrol.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {EXPENSE_CATEGORIES.map((c) => {
            const Icon = c.icon;
            const spent = spentByCat[c.id] || 0;
            const budget = budgets[c.id] || 0;
            const pct = budget > 0 ? Math.min(150, (spent / budget) * 100) : 0;
            const over = budget > 0 && spent > budget;
            return (
              <div key={c.id} style={{ border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Icon size={14} color={c.color} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, flex: 1 }}>{c.label}</span>
                  {over && <AlertTriangle size={13} color={COLORS.expense} />}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11.5, color: COLORS.sub }}>
                    Terpakai <b style={{ color: over ? COLORS.expense : COLORS.ink }}>{fmtRM(spent)}</b>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11, color: COLORS.sub }}>Batas RM</span>
                    <input
                      type="number" min="0" step="10"
                      value={budget}
                      onChange={(e) => onUpdateBudget(c.id, parseFloat(e.target.value) || 0)}
                      style={{ width: 62, padding: "4px 6px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 11.5 }}
                    />
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: COLORS.line }}>
                  <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, borderRadius: 4, background: over ? COLORS.expense : c.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
