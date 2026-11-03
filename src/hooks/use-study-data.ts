"use client";

import { useEffect, useState } from "react";
import {
  loadMaterials,
  loadQuizHistory,
  type StoredMaterial,
  type StoredQuizAttempt,
} from "@/lib/study-data";

type StudyData = {
  materials: StoredMaterial[];
  attempts: StoredQuizAttempt[];
  ready: boolean;
};

/**
 * Loads saved materials and quiz attempts from the browser and keeps them
 * fresh when the tab regains focus or storage changes (same behaviour the
 * dashboard and progress pages already had).
 */
export function useStudyData(): StudyData {
  const [data, setData] = useState<StudyData>({
    materials: [],
    attempts: [],
    ready: false,
  });

  useEffect(() => {
    function load() {
      setData({
        materials: loadMaterials(),
        attempts: loadQuizHistory(),
        ready: true,
      });
    }

    load();
    window.addEventListener("focus", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("focus", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return data;
}
