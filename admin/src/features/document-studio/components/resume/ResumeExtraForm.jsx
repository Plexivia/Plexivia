import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const inputCls = 'w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none';

const PERSONAL_DETAIL_FIELDS = [
  { key: 'fatherName', label: "Father's Name" },
  { key: 'motherName', label: "Mother's Name" },
  { key: 'dateOfBirth', label: 'Date of Birth', placeholder: 'e.g. 26/11/2002' },
  { key: 'gender', label: 'Gender' },
  { key: 'nationality', label: 'Nationality' },
  { key: 'religion', label: 'Religion' },
  { key: 'bloodGroup', label: 'Blood Group' },
  { key: 'maritalStatus', label: 'Marital Status' },
  { key: 'height', label: 'Height', placeholder: "e.g. 5'6\"" },
  { key: 'mobile', label: 'Mobile Phone No.' },
  { key: 'presentAddress', label: 'Present / Mailing Address', wide: true },
  { key: 'permanentAddress', label: 'Permanent Address', wide: true }
];

const LANGUAGE_SKILLS = [
  { key: 'speaking', label: 'Speaking' },
  { key: 'listening', label: 'Listening' },
  { key: 'writing', label: 'Writing' },
  { key: 'reading', label: 'Reading' }
];

const Field = ({ label, wide, children }) => (
  <div className={wide ? 'sm:col-span-2' : ''}>
    <label className="block text-muted-foreground font-medium mb-1">{label}</label>
    {children}
  </div>
);

const SectionHeader = ({ title, hint, onAdd, addLabel }) => (
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
    {onAdd && (
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{addLabel}</span>
      </button>
    )}
  </div>
);

const ItemCard = ({ title, onRemove, children }) => (
  <div className="bg-muted/40 border border-border p-3.5 rounded-xl space-y-3">
    <div className="flex items-center justify-between border-b border-border pb-2">
      <span className="font-bold text-foreground">{title}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-destructive hover:text-destructive/80 p-1 rounded-lg transition-colors cursor-pointer"
        title="Remove"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">{children}</div>
  </div>
);

// Read an uploaded image file as a data URL
const readImage = (file, done) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onloadend = () => done(reader.result);
  reader.readAsDataURL(file);
};

// Render form tabs for the extended CV sections: details, academic extras and recognitions
export const ResumeExtraForm = ({ data, onChange, tab }) => {
  const personalDetails = data.personalDetails || {};
  const declaration = data.declaration || {};

  const setList = (key, list) => onChange({ ...data, [key]: list });
  const addItem = (key, item) => setList(key, [...(data[key] || []), { id: `${key}-${Date.now()}`, ...item }]);
  const updateItem = (key, id, field, value) =>
    setList(key, (data[key] || []).map(i => (i.id === id ? { ...i, [field]: value } : i)));
  const removeItem = (key, id) => setList(key, (data[key] || []).filter(i => i.id !== id));

  const textInput = (key, item, field, placeholder) => (
    <input
      type="text"
      placeholder={placeholder}
      value={item[field] || ''}
      onChange={e => updateItem(key, item.id, field, e.target.value)}
      className={inputCls}
    />
  );

  if (tab === 'details') {
    return (
      <div className="space-y-4 text-xs">
        <SectionHeader title="Personal Details" hint="Biodata fields shown in the Personal Details block of the CV." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PERSONAL_DETAIL_FIELDS.map(f => (
            <Field key={f.key} label={f.label} wide={f.wide}>
              <input
                type="text"
                placeholder={f.placeholder}
                value={personalDetails[f.key] || ''}
                onChange={e => onChange({ ...data, personalDetails: { ...personalDetails, [f.key]: e.target.value } })}
                className={inputCls}
              />
            </Field>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'academic') {
    const fieldwork = data.fieldwork || [];
    const languages = data.languages || [];
    return (
      <div className="space-y-6 text-xs">
        <div className="space-y-2">
          <SectionHeader title="Undergraduate Thesis" />
          <Field label="Thesis Topic">
            <input
              type="text"
              value={data.thesis?.title || ''}
              onChange={e => onChange({ ...data, thesis: { ...data.thesis, title: e.target.value } })}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="space-y-3">
          <SectionHeader
            title="Practical Fieldwork & Site Visits"
            onAdd={() => addItem('fieldwork', { title: '', date: '', location: '', description: '' })}
            addLabel="Add Visit"
          />
          {fieldwork.map((fw, idx) => (
            <ItemCard key={fw.id} title={`Visit #${idx + 1}`} onRemove={() => removeItem('fieldwork', fw.id)}>
              <Field label="Title">{textInput('fieldwork', fw, 'title')}</Field>
              <Field label="Date">{textInput('fieldwork', fw, 'date', 'e.g. April 2022')}</Field>
              <Field label="Location">{textInput('fieldwork', fw, 'location')}</Field>
              <Field label="Description" wide>
                <textarea
                  rows={2}
                  value={fw.description || ''}
                  onChange={e => updateItem('fieldwork', fw.id, 'description', e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </ItemCard>
          ))}
        </div>

        <div className="space-y-3">
          <SectionHeader
            title="Proficiency in Language"
            onAdd={() => addItem('languages', { language: '', speaking: 'Good', listening: 'Good', writing: 'Good', reading: 'Good' })}
            addLabel="Add Language"
          />
          {languages.map((lang, idx) => (
            <ItemCard key={lang.id} title={`Language #${idx + 1}`} onRemove={() => removeItem('languages', lang.id)}>
              <Field label="Language" wide>{textInput('languages', lang, 'language', 'e.g. English')}</Field>
              {LANGUAGE_SKILLS.map(s => (
                <Field key={s.key} label={s.label}>{textInput('languages', lang, s.key, 'Excellent / Good / Fair')}</Field>
              ))}
            </ItemCard>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'recognition') {
    const awards = data.awards || [];
    const activities = data.activities || [];
    const references = data.references || [];
    return (
      <div className="space-y-6 text-xs">
        <div className="space-y-3">
          <SectionHeader
            title="Honors & Awards"
            onAdd={() => addItem('awards', { title: '', description: '' })}
            addLabel="Add Award"
          />
          {awards.map((aw, idx) => (
            <ItemCard key={aw.id} title={`Award #${idx + 1}`} onRemove={() => removeItem('awards', aw.id)}>
              <Field label="Title" wide>{textInput('awards', aw, 'title')}</Field>
              <Field label="Organized By / Details" wide>{textInput('awards', aw, 'description')}</Field>
            </ItemCard>
          ))}
        </div>

        <div className="space-y-3">
          <SectionHeader
            title="Extracurricular Activities / Leadership"
            onAdd={() => addItem('activities', { title: '', organization: '', date: '' })}
            addLabel="Add Activity"
          />
          {activities.map((ac, idx) => (
            <ItemCard key={ac.id} title={`Activity #${idx + 1}`} onRemove={() => removeItem('activities', ac.id)}>
              <Field label="Role / Title" wide>{textInput('activities', ac, 'title')}</Field>
              <Field label="Organization">{textInput('activities', ac, 'organization')}</Field>
              <Field label="Date">{textInput('activities', ac, 'date', 'e.g. May 2024')}</Field>
            </ItemCard>
          ))}
        </div>

        <div className="space-y-3">
          <SectionHeader
            title="References"
            onAdd={() => addItem('references', { name: '', designation: '', organization: '', phone: '', email: '' })}
            addLabel="Add Reference"
          />
          {references.map((rf, idx) => (
            <ItemCard key={rf.id} title={`Reference #${idx + 1}`} onRemove={() => removeItem('references', rf.id)}>
              <Field label="Name">{textInput('references', rf, 'name')}</Field>
              <Field label="Designation">{textInput('references', rf, 'designation')}</Field>
              <Field label="Organization" wide>{textInput('references', rf, 'organization')}</Field>
              <Field label="Phone">{textInput('references', rf, 'phone')}</Field>
              <Field label="Email">{textInput('references', rf, 'email')}</Field>
            </ItemCard>
          ))}
        </div>

        <div className="space-y-3">
          <SectionHeader title="Declaration & Signature" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Declaration Text" wide>
              <textarea
                rows={3}
                value={declaration.text || ''}
                onChange={e => onChange({ ...data, declaration: { ...declaration, text: e.target.value } })}
                className={`${inputCls} resize-none`}
              />
            </Field>
            <Field label="Signer Name">
              <input
                type="text"
                value={declaration.signerName || ''}
                onChange={e => onChange({ ...data, declaration: { ...declaration, signerName: e.target.value } })}
                className={inputCls}
              />
            </Field>
            <Field label="Issued Date">
              <input
                type="text"
                placeholder="e.g. Sept 2026"
                value={declaration.issuedDate || ''}
                onChange={e => onChange({ ...data, declaration: { ...declaration, issuedDate: e.target.value } })}
                className={inputCls}
              />
            </Field>
            <Field label="Signature Image" wide>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => readImage(e.target.files?.[0], url => onChange({ ...data, declaration: { ...declaration, signatureUrl: url } }))}
                  className="text-[11px] text-muted-foreground"
                />
                {declaration.signatureUrl && (
                  <>
                    <img src={declaration.signatureUrl} alt="Signature" className="h-10 border border-border rounded bg-white" />
                    <button
                      type="button"
                      onClick={() => onChange({ ...data, declaration: { ...declaration, signatureUrl: '' } })}
                      className="text-destructive hover:underline text-[11px]"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </Field>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export { readImage };
