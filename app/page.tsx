"use client";
import { NAME_PATTERN, isEnglishName } from "../lib/rsvp";
import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import GuestList from "./components/GuestList";
import BackgroundMusic from "./components/BackgroundMusic";
import { event, countdown, calendarFile } from "../lib/event";

function Icon({ name }: { name: "cross" | "arrow" | "down" | "up" | "plus" }) {
  const paths = {
    cross: "M12 2v20M5 9h14",
    arrow: "M5 19 19 5M5 5h14v14",
    down: "M12 3v18M5 14l7 7 7-7",
    up: "M12 21V3M5 10l7-7 7 7",
    plus: "M12 5v14M5 12h14",
  };
  return (
    <svg
      className="line-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}

const childrenHint =
  "Підкажіть, будь ласка, кількість і вік дітей, щоб ми могли подбати про місця за окремим дитячим столиком";
function Countdown() {
  const [remaining, setRemaining] = useState<number[] | null>(null);
  useEffect(() => {
    const update = () => setRemaining(countdown(Date.now()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section
      className="countdown-section"
      id="countdown"
      aria-label="Зворотний відлік"
    >
      <p className="eyebrow">ДО НАШОЇ СВІТЛОЇ ЗУСТРІЧІ</p>
      <div className="countdown">
        {["ДНІВ", "ГОДИН", "ХВИЛИН", "СЕКУНД"].map((label, i) => (
          <div key={label}>
            <strong>
              {remaining ? String(remaining[i]).padStart(2, "0") : "—"}
            </strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      {remaining?.every((n) => n === 0) && <p>Цей особливий день настав ♡</p>}
    </section>
  );
}
function RSVP() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    fetch("/api/rsvp")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAvailable(Boolean(data?.configured)))
      .catch(() => {});
  }, []);
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState("yes");
  const [adults, setAdults] = useState("1");
  const [companions, setCompanions] = useState<string[]>([]);
  const [withChildren, setWithChildren] = useState("no");
  const [ages, setAges] = useState<string[]>([""]);
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "preview" | "error"
  >("idle");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isEnglishName(name)) return;
    const childAges =
      attendance === "yes" && withChildren === "yes" ? ages.map(Number) : [];
    const payload = {
      name: name.trim(),
      attendance,
      adults: attendance === "yes" ? Number(adults) : 0,
      adultNames: attendance === "yes" ? [name.trim(), ...companions.map(n => n.trim())] : [],
      withChildren: childAges.length > 0,
      childrenCount: childAges.length,
      childrenAges: childAges,
      _subject: "Хрестини Терези — відповідь гостя",
    };
    if (!available) {
      setStatus("preview");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Submission failed");
      setStatus("sent");
      window.dispatchEvent(new Event("rsvp-saved"));
    } catch {
      setStatus("error");
    }
  }
  if (status === "sent")
    return (
      <div className="success" role="status">
        <span>♡</span>
        <h3>Дякуємо за відповідь!</h3>
        <p>
          {attendance === "yes"
            ? "Будемо раді розділити з вами цей світлий день."
            : "Дякуємо, що повідомили. Відчуваємо ваше тепло навіть на відстані."}
        </p>
      </div>
    );
  return (
    <form onSubmit={submit} className="rsvp-form">
      <fieldset disabled={status === "sending"} className="form-fields">
        <label htmlFor="name">Ім’я та прізвище</label>
        <input
          id="name"
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            e.target.setCustomValidity(e.target.value && !isEnglishName(e.target.value) ? "Введіть ім’я та прізвище англійськими літерами (A–Z)." : "");
            setStatus("idle");
          }}
          required
          pattern={NAME_PATTERN}
          title="Англійські літери A–Z, пробіл, дефіс або апостроф"
          aria-describedby="name-hint"
          maxLength={100}
        />
        <p id="name-hint" className="children-hint">Ім’я та прізвище — англійськими літерами (A–Z).</p>
        <fieldset>
          <legend>Чи плануєте бути на святі?</legend>
          <div className="choices">
            {[
              ["yes", "Так, із радістю"],
              ["no", "На жаль, ні"],
            ].map(([value, label]) => (
              <label
                key={value}
                className={attendance === value ? "selected" : ""}
              >
                <input
                  type="radio"
                  name="attendance"
                  value={value}
                  checked={attendance === value}
                  onChange={() => {
                    setAttendance(value);
                    setStatus("idle");
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {attendance === "yes" && (
          <>
            <label htmlFor="adults">Кількість дорослих (включно з вами)</label>
            <select id="adults" required value={adults} onChange={e => {
              setAdults(e.target.value);
              setCompanions(previous => Array.from({length:Number(e.target.value)-1}, (_, i) => previous[i] ?? ""));
            }}>
              {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {companions.map((person, i) => <div key={i}>
              <label htmlFor={`adult-${i+2}`}>Ім’я та прізвище {["другого", "третього", "четвертого"][i]} дорослого</label>
              <input id={`adult-${i+2}`} value={person} required maxLength={100} pattern={NAME_PATTERN} title="Англійські літери A–Z, пробіл, дефіс або апостроф" aria-describedby="name-hint" onChange={e => {
                const value=e.target.value;
                e.target.setCustomValidity(value && !isEnglishName(value) ? "Введіть ім’я та прізвище англійськими літерами (A–Z)." : "");
                setCompanions(previous => previous.map((n,j) => i===j ? value : n));
              }}/>
            </div>)}
            <fieldset aria-describedby="children-hint">
              <legend>Чи будете з дітьми?</legend>
              <div className="choices">
                {[
                  ["yes", "Так"],
                  ["no", "Ні"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className={withChildren === value ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name="withChildren"
                      value={value}
                      checked={withChildren === value}
                      onChange={() => setWithChildren(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {withChildren === "yes" && (
              <div className="children-fields">
                <label htmlFor="children-count">Кількість дітей</label>
                <select
                  id="children-count"
                  value={ages.length}
                  aria-describedby="children-hint"
                  onChange={(e) =>
                    setAges((previous) =>
                      Array.from(
                        { length: Number(e.target.value) },
                        (_, i) => previous[i] ?? "",
                      ),
                    )
                  }
                >
                  {Array.from({ length: 20 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <div className="age-grid">
                  {ages.map((age, i) => (
                    <div key={i}>
                      <label htmlFor={`age-${i}`}>Вік дитини {i + 1}</label>
                      <select
                        id={`age-${i}`}
                        required
                        value={age}
                        onChange={(e) =>
                          setAges((previous) =>
                            previous.map((v, j) =>
                              j === i ? e.target.value : v,
                            ),
                          )
                        }
                      >
                        <option value="">Оберіть вік</option>
                        <option value="0">До 1 року</option>
                        {Array.from({ length: 17 }, (_, n) => (
                          <option key={n + 1} value={n + 1}>
                            {n + 1} {n === 0 ? "рік" : n < 4 ? "роки" : "років"}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="children-hint" id="children-hint">
              {childrenHint}
            </p>
          </>
        )}
        <p className="children-hint">
          Після підтвердження ваше ім’я та кількість гостей з’являться у
          відкритому списку «Будуть із нами».
        </p>
        <button className="button" type="submit">
          {status === "sending"
            ? "Надсилаємо…"
            : available
              ? "Підтвердити присутність"
              : "Переглянути відповідь"}{" "}
          <span>
            <Icon name="arrow" />
          </span>
        </button>
      </fieldset>
      {!available && (
        <p className="form-note">
          Попередній перегляд: надсилання відповідей ще не підключене.
        </p>
      )}
      {status === "preview" && (
        <p role="status" className="form-note">
          {name}, обрано:{" "}
          {attendance === "yes"
            ? `${adults} дорослих; дітей: ${withChildren === "yes" ? ages.length : 0}`
            : "не зможу бути"}
          . Відповідь не надіслана.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="error">
          Не вдалося надіслати відповідь. Спробуйте ще раз — введені дані
          збережені у формі.
        </p>
      )}
    </form>
  );
}
export default function Home() {
  function calendar() {
    const url = URL.createObjectURL(
      new Blob([calendarFile()], { type: "text/calendar;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "tereza-christening.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <main>
      <BackgroundMusic />
      <nav className="navigation" aria-label="Навігація">
        <a className="brand" href="#home">
          little blessing
        </a>
        <div>
          <a href="#day">Програма</a>
        </div>
      </nav>
      <header className="hero" id="home">
        <div className="hero-content">
          <p className="eyebrow">25 ЖОВТНЯ 2026 · ІЛЛІНОЙС</p>
          <p className="invited">You're Invited</p>
          <h1>
            Маленьке диво.
            <br />
            Велика <em>любов.</em>
          </h1>
          <p className="hero-copy">
            Запрошуємо на хрестини нашої Терези —<br />
            розділити тепло, обійми та її світлий день.
          </p>
        </div>
        <div className="hero-art">
          <div className="organic-shape" />
          <div className="arch-outline" />
          <div className="photo-frame">
            {event.photo ? (
              <>
                <Image
                  src={event.photo}
                  alt="Тереза солодко спить у сповиванні"
                  fill
                  sizes="(max-width: 700px) 70vw, 350px"
                  className="portrait-photo"
                />
              </>
            ) : (
              <div className="photo-placeholder">
                <span>Т</span>
                <p>наше маленьке диво</p>
                <span className="small-cross">♡</span>
              </div>
            )}
          </div>
          <Image
            className="pampas hero-pampas"
            src="/pampas-watercolor.png"
            alt=""
            width={260}
            height={390}
          />
          <div className="hero-cross-decoration" aria-hidden="true">
            <Icon name="cross" />
          </div>
          <span className="baby-caption">оточена любов’ю ♡</span>
          <span className="round-label">
            <b>25.10</b>
            <span>2026</span>
          </span>
        </div>
        <a className="scroll" href="#countdown">
          ЦЕЙ ДЕНЬ — ПРО ЛЮБОВ{" "}
          <span>
            <Icon name="down" />
          </span>
        </a>
      </header>
      <div className="date-ribbon">
        <span>Терезин особливий день</span>
        <i aria-hidden="true">·</i>
        <span>25 жовтня 2026</span>
        <i aria-hidden="true">·</i>
        <span>У колі найрідніших</span>
      </div>
      <Countdown />
      <section className="section day-section" id="day">
        <div className="section-heading">
          <p className="eyebrow">25 ЖОВТНЯ 2026</p>
          <h2>
            Програма <em>нашого дня</em>
          </h2>
          <p>Увесь час вказано за місцевим часом Чикаго.</p>
        </div>
        <div className="day-grid">
          <article className="place">
            <span className="step">01 / ХРЕЩЕННЯ</span>
            <p className="time">
              14:00 <small>2 PM</small>
            </p>
            <h3>Таїнство хрещення</h3>
            <p className="place-note">
              Для всіх, хто бажає долучитися до церемонії.
            </p>
            <p className="address">{event.churchAddress}</p>
            <a
              className="map-link"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.churchAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Відкрити в Google Maps <Icon name="arrow" />
            </a>
          </article>
          <article className="place">
            <span className="step">02 / СВЯТКУВАННЯ</span>
            <p className="time">
              16:00 <small>4 PM</small>
            </p>
            <h3>Ресторан «{event.restaurant}»</h3>
            <p className="place-note">Святкування у колі найрідніших</p>
            <p className="address">{event.restaurantAddress}</p>
            <a
              className="map-link"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.restaurantAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Відкрити в Google Maps <Icon name="arrow" />
            </a>
          </article>
        </div>
        <button className="calendar" onClick={calendar}>
          <Icon name="plus" /> Додати до календаря
        </button>
      </section>
      <section className="gifts-section" id="gifts">
        <div className="gifts-art">
          <Image
            className="pampas"
            src="/pampas-watercolor.png"
            alt=""
            width={280}
            height={420}
          />
          <div className="gift-cross-decoration" aria-hidden="true">
            <Icon name="cross" />
          </div>
          <span>з любов’ю до дрібниць</span>
        </div>
        <div className="gifts">
          <span className="gift-heart" aria-hidden="true">
            ♡
          </span>
          <p className="eyebrow">КІЛЬКА СЛІВ ВІД НАШОЇ РОДИНИ</p>
          <h2>
            Найцінніше — <em>бути разом</em>
          </h2>
          <p>
            Будемо щасливі розділити з вами світле свято хрестин нашої Терези.
            Ваша присутність і щирі побажання — найцінніше для нашої родини.
          </p>
          <div className="gift-request">
            <span className="eyebrow">ВАЖЛИВЕ ПРОХАННЯ</span>
            <p>
              Якщо ви захочете додатково привітати нашу донечку, будемо вдячні
              за подарунок у конверті.
            </p>
            <p>
              <strong>
                Просимо обійтися без квітів, іграшок, підгузків та інших
                подарунків.
              </strong>{" "}
              Дякуємо за розуміння й за те, що будете поруч у цей особливий
              день!
            </p>
          </div>
        </div>
      </section>
      <div className="rsvp-background">
        <section className="section rsvp-section" id="rsvp">
          <div className="rsvp-copy">
            <p className="eyebrow">ЧЕКАЄМО НА ВАШУ ВІДПОВІДЬ</p>
            <h2>
              Ви будете
              <br /> <em>з нами?</em>
            </h2>
            <p>
              Підтвердьте, будь ласка, присутність, щоб ми могли подбати про
              комфорт кожного гостя — і великого, і маленького.
            </p>
            <span className="signature">Для вас завжди є місце ♡</span>
          </div>
          <RSVP />
        </section>
      </div>
      <GuestList />
      <footer>
        <span className="footer-name">Тереза</span>
        <p>25 жовтня 2026 · З любов’ю, наша родина</p>
        <p className="music-credit">
          Музика:{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Lysenko-Lullaby_(%C2%AB%D0%9F%D1%96%D1%81%D0%BD%D1%8F_%D0%BF%D1%80%D0%B8_%D0%BA%D0%BE%D0%BB%D0%B8%D1%81%D1%86%D1%96%C2%BB).ogg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Микола Лисенко, «При колисці», фортепіано Зеновія-Анна Данчак; запис
            Юрія Булки (MP3-транскод)
          </a>{" "}
          ·{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY-SA 3.0
          </a>
        </p>
        <a href="#home">
          До початку <Icon name="up" />
        </a>
      </footer>
    </main>
  );
}
