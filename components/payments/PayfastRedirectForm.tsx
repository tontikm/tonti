"use client";

import { useEffect, useRef } from "react";

type PayfastRedirectFormProps = {
  action: string;
  fields: Record<string, string>;
};

export function PayfastRedirectForm({ action, fields }: PayfastRedirectFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <form ref={formRef} action={action} method="POST" className="sr-only">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </form>
  );
}
