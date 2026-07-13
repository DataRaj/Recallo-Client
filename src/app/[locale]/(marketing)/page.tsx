import type { Metadata } from "next";
import { Lock, MessageSquare, Mic, Monitor, Video, Zap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { JoinRoomCTA } from "@/components/marketing/join-room-cta";

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Index" });
  return {
    title: "Recallo — Private, Fast, Beautiful Video Communication",
    description:
      t("meta_description") ||
      "Meet, collaborate, and connect with a platform built for clarity, speed, and your personal style.",
  };
}

const FEATURES = [
  {
    icon: Video,
    title: "HD Video Calls",
    desc: "Crystal-clear one-to-one and group video calls with adaptive quality control.",
    color: "var(--color-text-accent)",
  },
  {
    icon: Mic,
    title: "Webinar Hosting",
    desc: "Run professional webinars with audience Q&A, recording, and live analytics.",
    color: "var(--color-accent)",
  },
  {
    icon: MessageSquare,
    title: "Built-in Chat",
    desc: "Rich in-room messaging with reactions, threads, and seamless file sharing.",
    color: "var(--color-text-secondary)",
  },
  {
    icon: Monitor,
    title: "Screen Sharing",
    desc: "Share your entire screen, a window, or a single tab — instantly.",
    color: "var(--color-chat-accent)",
  },
  {
    icon: Lock,
    title: "End-to-End Privacy",
    desc: "Your meetings are private by default. Zero tracking. Zero ads. Ever.",
    color: "var(--color-text-accent)",
  },
  {
    icon: Zap,
    title: "Ultra Low Latency",
    desc: "WebRTC-powered real-time communication that feels completely instant.",
    color: "var(--color-accent)",
  },
];

const AVATARS = [
  { initials: "AK", bg: "var(--color-text-accent)" },
  { initials: "SM", bg: "var(--color-accent)" },
  { initials: "JD", bg: "var(--color-text-secondary)" },
  { initials: "RC", bg: "var(--color-chat-accent)" },
];

const MEETING_PARTICIPANTS = [
  { initials: "AK", name: "Alex K.", speaking: true },
  { initials: "SM", name: "Sarah M.", speaking: false },
  { initials: "JD", name: "Jordan D.", speaking: false },
  { initials: "ME", name: "You", speaking: false, isYou: true },
];

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="mx-auto max-w-5xl px-6 pt-26 pb-20">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Left: Copy */}
          <div className="animate-fade-up flex flex-col gap-7">
            {/* Beta badge */}
            <div
              className="inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium"
              style={{
                background: "rgba(176,186,153,0.18)",
                color: "var(--color-text-primary)",
                border: "1px solid rgba(176,186,153,0.4)",
              }}
            >
              <span className="animate-pulse-dot inline-block size-1.5 rounded-full bg-[var(--color-chat-accent)]" />
              Now in public beta
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-4">
              <h1
                className="text-5xl leading-[1.08] font-semibold tracking-tight lg:text-[56px]"
                style={{ color: "var(--color-text-primary)" }}
              >
                Private, Fast,{" "}
                <span style={{ color: "var(--color-text-accent)" }}>
                  Beautiful
                </span>
                <br />
                Video Communication
              </h1>
              <p
                className="max-w-md text-lg leading-relaxed font-light"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Meet, collaborate, and connect — with a platform built for
                clarity, speed, and your personal style.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-[12px] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                style={{
                  background:
                    "linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)",
                  boxShadow: "0px 4px 16px rgba(186,90,90,0.3)",
                }}
              >
                <Video size={15} />
                Create a Room
              </Link>
              <JoinRoomCTA
                className="flex cursor-pointer items-center gap-2 rounded-[12px] px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-[var(--color-surface-hover)] active:scale-[0.97]"
                style={{
                  color: "var(--color-text-primary)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {AVATARS.map((a, i) => (
                  <div
                    key={i}
                    className="flex size-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white"
                    style={{ background: a.bg, zIndex: AVATARS.length - i }}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <span
                  className="font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  2,400+
                </span>{" "}
                teams already collaborating
              </p>
            </div>
          </div>

          {/* Right: Product Mockup */}
          <div className="relative" style={{ animationDelay: "0.1s" }}>
            {/* Ambient glow */}
            <div
              className="pointer-events-none absolute -inset-8 rounded-[40px] opacity-20 blur-3xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-text-accent), var(--color-accent))",
              }}
            />

            {/* Browser chrome */}
            <div
              className="animate-fade-up relative overflow-hidden rounded-[18px]"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                boxShadow:
                  "0px 24px 64px rgba(0,0,0,0.08), 0px 1px 0px rgba(255,255,255,0.8) inset",
                animationDelay: "0.15s",
              }}
            >
              {/* Browser bar */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div className="flex gap-1.5">
                  <div
                    className="size-3 rounded-full"
                    style={{
                      background: "var(--color-text-accent)",
                      opacity: 0.7,
                    }}
                  />
                  <div
                    className="size-3 rounded-full"
                    style={{ background: "var(--color-accent)", opacity: 0.7 }}
                  />
                  <div
                    className="size-3 rounded-full"
                    style={{
                      background: "var(--color-chat-accent)",
                      opacity: 0.7,
                    }}
                  />
                </div>
                <div
                  className="flex h-6 flex-1 items-center rounded-[6px] px-3 text-xs"
                  style={{
                    background: "var(--color-bg)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  recallo.tech/room/morning-standup
                </div>
              </div>

              {/* Meeting UI */}
              <div
                style={{
                  background: "#1a2425",
                  padding: "16px",
                  minHeight: "300px",
                }}
              >
                {/* Header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex size-5 items-center justify-center rounded-[5px] text-[10px] font-semibold text-white"
                      style={{
                        background: "linear-gradient(135deg, #BA5A5A, #8A4040)",
                      }}
                    >
                      R
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Morning Standup
                    </span>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px]"
                    style={{
                      background: "rgba(156,197,161,0.2)",
                      color: "var(--color-chat-accent)",
                    }}
                  >
                    Live
                  </span>
                </div>

                {/* Video grid */}
                <div className="mb-3 grid grid-cols-2 gap-2.5">
                  {MEETING_PARTICIPANTS.map((p, i) => (
                    <div
                      key={i}
                      className="relative flex flex-col items-center justify-center rounded-[10px] py-5"
                      style={{
                        background: p.speaking
                          ? "rgba(156,197,161,0.12)"
                          : "var(--color-chat-bg)",
                        border: p.speaking
                          ? "1.5px solid var(--color-chat-accent)"
                          : "1px solid rgba(255,255,255,0.06)",
                        minHeight: "80px",
                      }}
                    >
                      <div
                        className="mb-1.5 flex size-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{
                          background: p.isYou
                            ? "var(--color-text-accent)"
                            : "rgba(255,255,255,0.12)",
                        }}
                      >
                        {p.initials}
                      </div>
                      <span
                        className="text-[10px]"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        {p.name}
                      </span>
                      {p.speaking && (
                        <div className="absolute top-2 right-2 flex items-end gap-[2px]">
                          {[3, 5, 4, 6, 3].map((h, j) => (
                            <div
                              key={j}
                              className="w-[2px] rounded-full"
                              style={{
                                height: h,
                                background: "var(--color-chat-accent)",
                                opacity: 0.85,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Controls dock */}
                <div
                  className="flex items-center justify-center gap-2 rounded-[12px] p-2"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {[
                    {
                      label: "Mic",
                      active: true,
                      color: "var(--color-surface)",
                    },
                    {
                      label: "Cam",
                      active: true,
                      color: "var(--color-surface)",
                    },
                    {
                      label: "Share",
                      active: false,
                      color: "rgba(255,255,255,0.4)",
                    },
                    {
                      label: "Chat",
                      active: false,
                      color: "rgba(255,255,255,0.4)",
                    },
                    {
                      label: "Leave",
                      active: false,
                      color: "#fff",
                      bg: "var(--color-text-accent)",
                    },
                  ].map((ctrl, i) => (
                    <div
                      key={i}
                      className="flex size-8 items-center justify-center rounded-[9px]"
                      style={{
                        background:
                          ctrl.bg ||
                          (ctrl.active
                            ? "rgba(255,255,255,0.12)"
                            : "rgba(255,255,255,0.06)"),
                      }}
                    >
                      <div
                        className="size-3 rounded-[3px]"
                        style={{
                          background: ctrl.color,
                          opacity: ctrl.active ? 0.9 : 0.5,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        className="mx-auto max-w-5xl px-6 py-20"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div className="mb-14 text-center">
          <h2
            className="mb-3 text-[36px] font-semibold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Everything you need to connect
          </h2>
          <p
            className="mx-auto max-w-xl text-lg font-light"
            style={{ color: "var(--color-text-secondary)" }}
          >
            A complete communication platform — from quick calls to large
            webinars.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group cursor-default rounded-[16px] p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                boxShadow: "0px 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <div
                className="mb-5 flex size-10 items-center justify-center rounded-[12px] transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${f.color}15`, color: f.color }}
              >
                <f.icon size={20} />
              </div>
              <h3
                className="mb-2 font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div
          className="rounded-[24px] p-12 text-center lg:p-16"
          style={{
            background:
              "linear-gradient(135deg, var(--color-text-primary) 0%, #3a5040 100%)",
            boxShadow: "0px 24px 64px rgba(44,62,45,0.2)",
          }}
        >
          <h2 className="mb-3 text-[36px] font-semibold tracking-tight text-white">
            Start your first meeting today
          </h2>
          <p
            className="mx-auto mb-8 max-w-md text-lg font-light"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            No downloads required. No setup friction. Just click and connect.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-[12px] px-8 py-3.5 text-sm font-medium transition-all duration-200 hover:opacity-95 active:scale-[0.97]"
              style={{
                background: "var(--color-bg)",
                color: "var(--color-text-primary)",
              }}
            >
              Get Started Free
            </Link>
            <Link
              href="#demo"
              className="rounded-[12px] px-8 py-3.5 text-sm font-medium transition-all duration-200 hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Watch Demo →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
