"use client";

import { useCallback, useMemo, useState } from "react";
import { GarageImage } from "@/components/media/GarageImage";
import { useCommunity } from "@/hooks/useCommunity";
import { communityOntologyService } from "@/services/communityOntologyService";
import { exportCommunityJson, loadCommunityState } from "@/lib/communityStore";
import { MIN_DRIVING_SPEED_MPH } from "@/lib/locationSharing";
import type { GarageVehicle } from "@/types/communityOntology";

type Tab = "profile" | "garage" | "export";

export function GaragePageClient() {
  const [state, refresh] = useCommunity();
  const me = state.memberProfiles.find(
    (m) => m.id === state.currentMemberId,
  )!;
  const myCars = useMemo(
    () =>
      state.garageVehicles.filter(
        (v) => v.ownerMemberId === state.currentMemberId,
      ),
    [state.garageVehicles, state.currentMemberId],
  );

  const [tab, setTab] = useState<Tab>("profile");
  const [interestInput, setInterestInput] = useState("");
  const [editingCarId, setEditingCarId] = useState<string | null>(null);

  const updateProfile = useCallback(
    (patch: Parameters<typeof communityOntologyService.updateProfile>[1]) => {
      communityOntologyService.updateProfile(state.currentMemberId, patch);
      refresh();
    },
    [state.currentMemberId, refresh],
  );

  const addInterest = useCallback(() => {
    const t = interestInput.trim();
    if (!t) return;
    updateProfile({
      carInterests: [...new Set([...me.carInterests, t])],
    });
    setInterestInput("");
  }, [interestInput, me.carInterests, updateProfile]);

  const removeInterest = useCallback(
    (tag: string) => {
      updateProfile({
        carInterests: me.carInterests.filter((x) => x !== tag),
      });
    },
    [me.carInterests, updateProfile],
  );

  const downloadOntology = useCallback(() => {
    const blob = new Blob([exportCommunityJson(loadCommunityState())], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `racer-community-ontology-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 py-6 md:px-8 md:py-8 lg:px-10">
      <header className="mb-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] md:text-xs">
          Your space
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Garage
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] md:text-base">
          Profile, builds, and exports shaped for Foundry Ontology sync (MVP:
          local JSON).
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
        {(
          [
            ["profile", "Profile"],
            ["garage", "Cars"],
            ["export", "Ontology export"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              tab === k
                ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]">
              {me.profileImageUrl ? (
                <GarageImage
                  src={me.profileImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl font-bold text-[var(--muted)]">
                  {me.displayName.slice(0, 1)}
                </div>
              )}
            </div>
            <label className="mt-4 block text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Profile image URL
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="https://… or leave empty"
              defaultValue={me.profileImageUrl ?? ""}
              onBlur={(e) =>
                updateProfile({
                  profileImageUrl: e.target.value.trim() || null,
                })
              }
            />
            <p className="mt-2 text-[0.65rem] text-[var(--muted)]">
              For large uploads, use a host URL; Foundry will use media links in
              production.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Identity
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-[var(--muted)]">Display name</span>
                  <input
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    defaultValue={me.displayName}
                    onBlur={(e) =>
                      updateProfile({ displayName: e.target.value.trim() })
                    }
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-[var(--muted)]">Username</span>
                  <input
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    defaultValue={me.username}
                    onBlur={(e) =>
                      updateProfile({ username: e.target.value.trim() })
                    }
                  />
                </label>
              </div>
              <label className="mt-4 block text-sm">
                <span className="text-[var(--muted)]">Bio</span>
                <textarea
                  className="mt-1 min-h-[100px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  defaultValue={me.bio}
                  onBlur={(e) => updateProfile({ bio: e.target.value.trim() })}
                />
              </label>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Car interests
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {me.carInterests.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeInterest(tag)}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1 text-xs font-medium text-[var(--foreground)] hover:border-[var(--accent-soft)]"
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="Add tag (JDM, bikes, …)"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addInterest()}
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[#04100e]"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Current daily / primary
              </h2>
              <select
                className="mt-3 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                value={me.currentVehicleId ?? ""}
                onChange={(e) => {
                  const vid = e.target.value || null;
                  if (vid) communityOntologyService.setPrimaryVehicle(me.id, vid);
                  else updateProfile({ currentVehicleId: null });
                  refresh();
                }}
              >
                <option value="">— Select —</option>
                {myCars.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Location & radar
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                Controls whether other drivers can see you on nearby radar when
                your telemetry is in range. “Driving” uses live speed (mph) from
                telemetry — currently hidden below {MIN_DRIVING_SPEED_MPH} mph.
              </p>
              {me.telemetryDriverId ? (
                <p className="mt-2 text-[0.65rem] text-[var(--muted)]">
                  Linked driver id:{" "}
                  <code className="rounded bg-[var(--surface-elevated)] px-1 text-[var(--accent)]">
                    {me.telemetryDriverId}
                  </code>
                </p>
              ) : (
                <p className="mt-2 text-[0.65rem] text-[var(--muted)]">
                  No radar driver link — privacy rules apply only when an admin
                  maps your profile to a Foundry driver id.
                </p>
              )}

              <fieldset className="mt-4 space-y-3">
                <legend className="sr-only">Location sharing mode</legend>
                {(
                  [
                    {
                      value: "off" as const,
                      label: "Hidden",
                      hint: "Never show my position to others on radar.",
                    },
                    {
                      value: "always" as const,
                      label: "Always when sharing is on",
                      hint: "Visible whenever telemetry is in range.",
                    },
                    {
                      value: "driving" as const,
                      label: "Only while driving",
                      hint: `Visible only at ≥ ${MIN_DRIVING_SPEED_MPH} mph.`,
                    },
                  ] as const
                ).map((opt) => {
                  const mode = !me.locationShareEnabled
                    ? "off"
                    : me.locationShareWhenDrivingOnly
                      ? "driving"
                      : "always";
                  return (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 has-[:checked]:border-[var(--accent-soft)] has-[:checked]:bg-[var(--accent-glow)]/30"
                    >
                      <input
                        type="radio"
                        name="locationShareMode"
                        className="mt-1"
                        checked={mode === opt.value}
                        onChange={() => {
                          if (opt.value === "off") {
                            updateProfile({
                              locationShareEnabled: false,
                              locationShareWhenDrivingOnly: false,
                            });
                          } else if (opt.value === "always") {
                            updateProfile({
                              locationShareEnabled: true,
                              locationShareWhenDrivingOnly: false,
                            });
                          } else {
                            updateProfile({
                              locationShareEnabled: true,
                              locationShareWhenDrivingOnly: true,
                            });
                          }
                        }}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--foreground)]">
                          {opt.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--muted)]">
                          {opt.hint}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </fieldset>

              <label className="mt-4 flex cursor-pointer gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={me.locationShareFriendsOnly}
                  disabled={!me.locationShareEnabled}
                  onChange={(e) =>
                    updateProfile({
                      locationShareFriendsOnly: e.target.checked,
                    })
                  }
                />
                <span>
                  <span className="block text-sm font-semibold text-[var(--foreground)]">
                    Friends only
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">
                    Only accepted friends see you (still respects driving-only
                    if that mode is on).
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "garage" ? (
        <div className="space-y-8">
          {myCars.map((car) => (
            <article
              key={car.id}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="grid gap-0 md:grid-cols-[min(420px,45%)_1fr]">
                <div className="relative aspect-[4/3] min-h-[220px] bg-[var(--surface-elevated)] md:min-h-[320px]">
                  {car.imageUrl ? (
                    <GarageImage
                      src={car.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      priority={car.id === "veh-krish-r34"}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--muted)]">
                      No photo
                    </div>
                  )}
                </div>
                <div className="flex flex-col p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      {car.isPrimary ? (
                        <span className="rounded-md bg-[var(--accent-glow)] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[var(--accent)]">
                          Primary
                        </span>
                      ) : null}
                      <h3 className="mt-2 text-xl font-semibold md:text-2xl">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {car.color}
                        {car.horsepowerEstimate
                          ? ` · ~${car.horsepowerEstimate} HP`
                          : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!car.isPrimary ? (
                        <button
                          type="button"
                          onClick={() => {
                            communityOntologyService.setPrimaryVehicle(
                              me.id,
                              car.id,
                            );
                            refresh();
                          }}
                          className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] hover:bg-white/5"
                        >
                          Set primary
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          setEditingCarId(editingCarId === car.id ? null : car.id)
                        }
                        className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#04100e]"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Mods & build
                    </h4>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--foreground)]">
                      {car.mods.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  {car.notes ? (
                    <p className="mt-4 text-sm italic text-[var(--muted)]">
                      {car.notes}
                    </p>
                  ) : null}

                  {editingCarId === car.id ? (
                    <CarEditForm
                      car={car}
                      onSave={() => {
                        setEditingCarId(null);
                        refresh();
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </article>
          ))}

          <AddCarForm
            ownerId={me.id}
            onAdded={() => {
              refresh();
            }}
          />
        </div>
      ) : null}

      {tab === "export" ? (
        <div className="max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <h2 className="text-lg font-semibold">Ontology document</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Downloads the full{" "}
            <code className="rounded bg-[var(--surface-elevated)] px-1 text-[var(--accent)]">
              CommunityOntologyState
            </code>{" "}
            JSON from localStorage — same shape you&apos;ll push through
            Foundry pipelines / OSDK later.
          </p>
          <button
            type="button"
            onClick={downloadOntology}
            className="mt-6 rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#04100e]"
          >
            Download JSON
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CarEditForm({
  car,
  onSave,
}: {
  car: GarageVehicle;
  onSave: () => void;
}) {
  const [color, setColor] = useState(car.color);
  const [imageUrl, setImageUrl] = useState(car.imageUrl ?? "");
  const [notes, setNotes] = useState(car.notes);
  const [modsText, setModsText] = useState(car.mods.join("\n"));
  const [hp, setHp] = useState(car.horsepowerEstimate?.toString() ?? "");

  return (
    <div className="mt-6 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <label className="block text-xs text-[var(--muted)]">
        Color / livery
        <input
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </label>
      <label className="block text-xs text-[var(--muted)]">
        Image URL
        <input
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </label>
      <label className="block text-xs text-[var(--muted)]">
        HP estimate
        <input
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />
      </label>
      <label className="block text-xs text-[var(--muted)]">
        Mods (one per line)
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
          value={modsText}
          onChange={(e) => setModsText(e.target.value)}
        />
      </label>
      <label className="block text-xs text-[var(--muted)]">
        Notes
        <textarea
          className="mt-1 min-h-[60px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={() => {
          communityOntologyService.updateGarageVehicle(car.id, {
            color,
            imageUrl: imageUrl.trim() || null,
            notes,
            mods: modsText
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean),
            horsepowerEstimate: hp.trim()
              ? Number.parseInt(hp, 10)
              : null,
          });
          onSave();
        }}
        className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[#04100e]"
      >
        Save car
      </button>
    </div>
  );
}

function AddCarForm({
  ownerId,
  onAdded,
}: {
  ownerId: string;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mods, setMods] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-[var(--border)] py-8 text-sm font-semibold text-[var(--muted)] hover:border-[var(--accent-soft)] hover:text-[var(--accent)]"
      >
        + Add another vehicle
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h3 className="font-semibold">New vehicle</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          placeholder="Make"
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={make}
          onChange={(e) => setMake(e.target.value)}
        />
        <input
          placeholder="Model"
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
        <input
          placeholder="Year"
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <input
          placeholder="Color / livery"
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <input
          placeholder="Image URL"
          className="sm:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <textarea
          placeholder="Mods (one per line)"
          className="min-h-[80px] sm:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={mods}
          onChange={(e) => setMods(e.target.value)}
        />
        <textarea
          placeholder="Notes"
          className="min-h-[50px] sm:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            communityOntologyService.addGarageVehicle({
              ownerMemberId: ownerId,
              make: make.trim(),
              model: model.trim(),
              year: Number.parseInt(year, 10) || new Date().getFullYear(),
              color: color.trim() || "—",
              imageUrl: imageUrl.trim() || null,
              mods: mods
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean),
              notes: notes.trim(),
              isPrimary: false,
              horsepowerEstimate: null,
            });
            setOpen(false);
            setMake("");
            setModel("");
            setYear("");
            setColor("");
            setImageUrl("");
            setMods("");
            setNotes("");
            onAdded();
          }}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[#04100e]"
        >
          Save vehicle
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
