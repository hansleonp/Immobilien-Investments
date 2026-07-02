"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSettings } from "@/lib/queries/settings";
import type { SettingsRow } from "@/types/database";

type GoalValues = Pick<SettingsRow, "goal_units" | "goal_year">;

export function GoalForm({ settings }: { settings: SettingsRow }) {
  const updateSettings = useUpdateSettings();
  const { register, handleSubmit, reset, formState } = useForm<GoalValues>({
    defaultValues: settings,
  });

  useEffect(() => {
    reset(settings);
  }, [settings, reset]);

  function onSubmit(values: GoalValues) {
    updateSettings.mutate(values, {
      onSuccess: () => toast.success("Ziel gespeichert"),
      onError: () => toast.error("Speichern fehlgeschlagen"),
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Kaufziel</CardTitle>
          <CardDescription>Wie viele Wohnungen bis wann?</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal_units">Anzahl Wohnungen</Label>
            <Input
              id="goal_units"
              type="number"
              min={1}
              step={1}
              {...register("goal_units", { valueAsNumber: true, required: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal_year">Zieljahr</Label>
            <Input
              id="goal_year"
              type="number"
              min={2026}
              step={1}
              {...register("goal_year", { valueAsNumber: true, required: true })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={updateSettings.isPending || !formState.isDirty}
          >
            {updateSettings.isPending ? "Speichern…" : "Speichern"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
