"use client";

import { useState, useEffect } from "react";

type SectionKey = "channels" | "directMessages" | "apps" | string;

/**
 * Custom hook to manage sidebar section state with localStorage persistence
 * @param key - The unique key for the section
 * @param defaultValue - The default open/closed state for the section
 * @returns A tuple with the current state and a toggle function
 */
export function useSidebarSection(
  key: SectionKey,
  defaultValue = true
): [boolean, () => void] {
  const storageKey = `sidebar_${key}`;
  const [isOpen, setIsOpen] = useState(defaultValue);

  // Load the state from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(storageKey);
      if (storedValue !== null) {
        setIsOpen(storedValue === "true");
      }
    }
  }, [storageKey]);

  // Toggle function that updates both state and localStorage
  const toggleSection = () => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, String(newState));
      }
      return newState;
    });
  };

  return [isOpen, toggleSection];
}

/**
 * Get the initial state for a sidebar section from localStorage
 * @param key - The unique key for the section
 * @param defaultValue - The default value if not found in localStorage
 * @returns The current state value
 */
export function getSidebarSectionState(
  key: SectionKey,
  defaultValue = true
): boolean {
  if (typeof window === "undefined") return defaultValue;

  const storageKey = `sidebar_${key}`;
  const storedValue = localStorage.getItem(storageKey);

  return storedValue === null ? defaultValue : storedValue === "true";
}

/**
 * Set the state for a sidebar section in localStorage
 * @param key - The unique key for the section
 * @param isOpen - The state to set
 */
export function setSidebarSectionState(key: SectionKey, isOpen: boolean): void {
  if (typeof window === "undefined") return;

  const storageKey = `sidebar_${key}`;
  localStorage.setItem(storageKey, String(isOpen));
}
