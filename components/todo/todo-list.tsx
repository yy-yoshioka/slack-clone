import { Button } from "@/components/ui/button";
import { Editor } from "@/components/editor";
import { useState } from "react";

export function TodoList() {
  const [quickActions] = useState([
    { id: 1, label: "📝 Note to self..." },
    { id: 2, label: "Tomorrow, I should..." },
  ]);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">To-do list</h1>
        <p className="text-muted-foreground">
          This is your space. We&apos;ve added a few things to help get you
          started, but feel free to use this canvas however you&apos;d like.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className="text-sm"
            onClick={() => {
              /* TODO: Implement quick action */
            }}
          >
            {action.label}
          </Button>
        ))}
      </div>

      <div className="flex-1">
        <Editor
          placeholder="Jot something down"
          onChange={() => {
            /* TODO: Implement onChange */
          }}
          onSubmit={() => {
            /* TODO: Implement onSubmit */
          }}
        />
      </div>

      <div className="mt-4">{/* TODO: Implement todo items list */}</div>
    </div>
  );
}
