"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ReactNode, Suspense, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

import { AccountChecker } from "../account/account-ui";
import {
  ClusterChecker,
  ClusterUiSelect,
  ExplorerLink,
} from "../cluster/cluster-ui";
import { WalletButton } from "../solana/solana-provider";

type NavLink = { label: string; path: string; accent?: boolean; secondary?: boolean; ghost?: boolean };

export function UiLayout({
  children,
  links,
}: {
  children: ReactNode;
  links: NavLink[];
}) {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0D0000] via-[#1A0004] to-[#2A0008] text-rose-50">
      <div className="navbar backdrop-blur border-b border-[#E23A1E]/30 bg-gradient-to-r from-[#0D0000]/95 via-[#1A0004]/90 to-[#2A0008]/95 text-rose-50 flex-col md:flex-row space-y-2 md:space-y-0 px-4 shadow-[0_20px_45px_rgba(0,0,0,0.65)]">
        <div className="flex-1">
          <Link className="btn btn-ghost normal-case text-xl text-rose-100" href="/">
            <Image alt="Logo" src="/logo.png" height={25} width={50} />
          </Link>
          <ul className="menu menu-horizontal px-1 space-x-2 text-sm">
            {links.map(({ label, path, accent, secondary, ghost }) => {
              const isActive = pathname.startsWith(path);
              const defaultClasses = [
                "inline-flex items-center px-3 py-2 rounded-xl font-medium transition-all duration-200",
                "text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400/80",
                "active:scale-95",
                isActive
                  ? "bg-white/10 text-rose-50 shadow-inner shadow-black/40"
                  : "text-rose-200/80 hover:text-rose-50 hover:bg-white/5",
              ].join(" ");
              const accentClasses = [
                "inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold tracking-wide",
                "bg-gradient-to-r from-[#E23A1E] via-[#EF5C2F] to-[#B02117] text-white shadow-[0_15px_35px_rgba(226,58,30,0.4)]",
                "transition-all duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5C2F]",
                isActive
                  ? "ring-2 ring-[#EF5C2F]/60 scale-105"
                  : "opacity-90 hover:opacity-100 hover:-translate-y-0.5",
              ].join(" ");
              const secondaryClasses = [
                "inline-flex items-center px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                "border border-[#EF5C2F]/60 text-[#EF5C2F] hover:text-white",
                "bg-black/20 hover:bg-[#E23A1E]/20 shadow-[0_8px_20px_rgba(0,0,0,0.35)] active:scale-95",
                isActive ? "bg-[#E23A1E]/20 text-white border-[#EF5C2F]" : "",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5C2F]",
              ].join(" ");
              const ghostClasses = [
                "inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "text-rose-200/80 border border-white/15 hover:text-white hover:border-[#EF5C2F]/50",
                "bg-white/5 hover:bg-white/10 active:scale-95 shadow-[0_6px_18px_rgba(0,0,0,0.35)]",
                isActive ? "text-white border-[#EF5C2F]/50" : "",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50",
              ].join(" ");
              return (
                <li key={path}>
                  <Link
                    className={
                      accent
                        ? accentClasses
                        : secondary
                        ? secondaryClasses
                        : ghost
                        ? ghostClasses
                        : defaultClasses
                    }
                    href={path}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex-none space-x-2">
          <WalletButton />
          <ClusterUiSelect />
        </div>
      </div>
      <ClusterChecker>
        <AccountChecker />
      </ClusterChecker>
      <div className="flex-grow mx-auto w-full max-w-6xl px-4 py-6">
        <Suspense
          fallback={
            <div className="text-center my-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 2500,
            style: {
              background:
                "linear-gradient(135deg, rgba(226,58,30,0.95), rgba(42,0,8,0.95))",
              color: "#FCEFF3",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 35px rgba(0,0,0,0.45)",
              borderRadius: "18px",
              padding: "14px 18px",
              fontFamily:
                '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            },
            success: {
              iconTheme: {
                primary: "#8ef9d5",
                secondary: "#0D0000",
              },
            },
            error: {
              iconTheme: {
                primary: "#ffb4a2",
                secondary: "#0D0000",
              },
            },
          }}
        />
      </div>
      <footer className="mt-12 border-t border-white/10 bg-gradient-to-r from-[#0D0000]/90 via-[#1A0004]/80 to-[#2A0008]/90 text-rose-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-rose-200/80">BeeHive</p>
            <p className="text-2xl font-semibold text-rose-50">Decentralized tipping for creators</p>
            <p className="text-sm text-rose-200/70">
              Built with Solana + Anchor. Manage BeeHive vaults, collect gratitude, and stay self-custodied.
            </p>
          </div>
          <div className="grid gap-6 text-sm text-rose-200/80 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-rose-200">Navigate</p>
              <Link className="block hover:text-rose-50" href="/beeHive">
                BeeHive
              </Link>
              <Link className="block hover:text-rose-50" href="/beeHive/accounts">
                My BeeHive
              </Link>
              <Link className="block hover:text-rose-50" href="/account">
                Account Tools
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-rose-200">Resources</p>
              <a
                className="block hover:text-rose-50"
                href="https://explorer.solana.com"
                target="_blank"
                rel="noreferrer"
              >
                Solana Explorer
              </a>
              <a className="block hover:text-rose-50" href="https://github.com/For8stt" target="_blank" rel="noreferrer">
                Github Repo
              </a>
              <Link className="block hover:text-rose-50" href="/clusters">
                Cluster Status
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-rose-200/70">
          © {year} BeeHive on Solana — crafted during Ackee Solana School.
        </div>
      </footer>
    </div>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || "Save"}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className="my-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0D0000] via-[#1A0004] to-[#2A0008] px-6 py-12 text-center shadow-[0_30px_55px_rgba(0,0,0,0.6)]">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        {typeof title === "string" ? (
          <h1 className="text-5xl font-bold text-rose-50">{title}</h1>
        ) : (
          title
        )}
        {typeof subtitle === "string" ? (
          <p className="text-rose-100/80">{subtitle}</p>
        ) : (
          subtitle
        )}
        {children}
      </div>
    </div>
  );
}

export function ellipsify(str = "", len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + ".." + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={"text-center"}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={"View Transaction"}
          className="btn btn-xs btn-primary"
        />
      </div>
    );
  };
}
