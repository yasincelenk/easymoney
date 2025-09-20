'use client';

import {useMemo, useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {createContractAction} from '@/app/actions/contracts';
import type {Language} from '@prisma/client';

export type TemplateSummary = {
  id: string;
  title: string;
  language: Language;
  jurisdiction: string;
  placeholders: string[];
  bodyRichtext: any;
};

export function NewContractWizard({templates}: {templates: TemplateSummary[]}) {
  const [step, setStep] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [title, setTitle] = useState('');
  const [counterpartyName, setCounterpartyName] = useState('');
  const [counterpartyEmail, setCounterpartyEmail] = useState('');
  const [preview, setPreview] = useState('');
  const [suggestions, setSuggestions] = useState<{title: string; body: string}[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const selectedTemplate = useMemo(() => templates.find((template) => template.id === selectedTemplateId) ?? null, [templates, selectedTemplateId]);

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (template) {
      setTitle(template.title);
      const initialValues = Object.fromEntries(template.placeholders.map((key) => [key, '']));
      setPlaceholderValues(initialValues);
    }
    setStep(1);
  }

  function handlePlaceholderChange(key: string, value: string) {
    setPlaceholderValues((prev) => ({...prev, [key]: value}));
  }

  function generatePreview() {
    if (!selectedTemplate) return;
    const content: string[] = selectedTemplate.bodyRichtext?.content ?? [];
    const rendered = content
      .map((line) => Object.entries(placeholderValues).reduce((acc, [key, value]) => acc.replace(new RegExp(`{${key}}`, 'g'), value || `{${key}}`), line))
      .join('\n\n');
    setPreview(rendered);
  }

  async function handleCreate() {
    if (!selectedTemplate) return;
    startTransition(async () => {
      const result = await createContractAction({
        templateId: selectedTemplate.id,
        language: selectedTemplate.language,
        title,
        placeholders: placeholderValues,
        counterpartyName,
        counterpartyEmail
      });
      setSuggestions(result.suggestions);
      router.push(`/contracts/${result.id}`);
    });
  }

  if (templates.length === 0) {
    return <p className="text-sm text-slate-500">No templates are available yet. Create one to start drafting.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span className={step === 0 ? 'font-semibold text-slate-900' : ''}>1. Choose template</span>
        <span>›</span>
        <span className={step === 1 ? 'font-semibold text-slate-900' : ''}>2. Fill placeholders</span>
        <span>›</span>
        <span className={step === 2 ? 'font-semibold text-slate-900' : ''}>3. Preview & create</span>
      </div>

      {step === 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer transition hover:border-primary" onClick={() => handleTemplateSelect(template.id)}>
              <CardHeader>
                <CardTitle>{template.title}</CardTitle>
                <CardDescription>
                  {template.jurisdiction} · {template.language.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                {template.placeholders.length} placeholders
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {step === 1 && selectedTemplate && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contract title</label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Counterparty name</label>
              <Input value={counterpartyName} onChange={(event) => setCounterpartyName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Counterparty email</label>
              <Input type="email" value={counterpartyEmail} onChange={(event) => setCounterpartyEmail(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {selectedTemplate.placeholders.map((key) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{key}</label>
                <Input value={placeholderValues[key] ?? ''} onChange={(event) => handlePlaceholderChange(key, event.target.value)} />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              onClick={() => {
                generatePreview();
                setStep(2);
              }}
              disabled={Object.values(placeholderValues).some((value) => !value)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Preview</h2>
            <Textarea className="h-64" value={preview} readOnly />
          </div>
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Suggested clauses</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.title}>
                    <strong>{suggestion.title}:</strong> {suggestion.body}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? 'Creating…' : 'Create contract'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
