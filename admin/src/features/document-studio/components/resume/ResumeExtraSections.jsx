import React from 'react';

const HEADING = {
  modern: 'text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-0.5 mb-1.5',
  classic: 'text-xs font-bold uppercase tracking-widest border-b border-slate-400 pb-0.5 mb-1.5 font-sans',
  technical: 'text-xs font-bold uppercase border-b border-slate-400 mb-1.5',
  engineer: 'text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5'
};

const DETAIL_ROWS = [
  ['Name', null],
  ["Father's Name", 'fatherName'],
  ["Mother's Name", 'motherName'],
  ['Date of Birth', 'dateOfBirth'],
  ['Gender', 'gender'],
  ['Nationality', 'nationality'],
  ['Religion', 'religion'],
  ['Blood Group', 'bloodGroup'],
  ['Marital Status', 'maritalStatus'],
  ['Height', 'height'],
  ['Mobile Phone No.', 'mobile'],
  ['Present / Mailing Address', 'presentAddress'],
  ['Permanent Address', 'permanentAddress']
];

const LANGUAGE_COLS = [
  ['Speaking', 'speaking'],
  ['Listening', 'listening'],
  ['Writing', 'writing'],
  ['Reading', 'reading']
];

// Render the extended CV sections (thesis through declaration) for the given template variant
export const ResumeExtraSections = ({ data, variant = 'modern', sections }) => {
  const show = (key) => !sections || sections.includes(key);
  const { thesis, fieldwork = [], languages = [], awards = [], activities = [], references = [], declaration = {} } = data;
  const personalDetails = data.personalDetails || {};
  const heading = HEADING[variant];

  const detailRows = DETAIL_ROWS
    .map(([label, key]) => [label, key ? personalDetails[key] : data.personalInfo.fullName])
    .filter(([, value]) => value);
  const hasDetails = detailRows.length > 1;
  const hasDeclaration = declaration.text || declaration.signatureUrl || declaration.signerName;

  return (
    <div className="space-y-4 text-xs">
      {show('thesis') && thesis?.title && (
        <div>
          <h3 className={heading}>Undergraduate Thesis</h3>
          <p className="text-slate-800 leading-snug">Topic: “{thesis.title}”</p>
        </div>
      )}

      {show('fieldwork') && fieldwork.length > 0 && (
        <div>
          <h3 className={heading}>Practical Fieldwork & Site Visits</h3>
          <div className="space-y-2">
            {fieldwork.map(fw => (
              <div key={fw.id} className="break-inside-avoid">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{fw.title}</span>
                  <span className="font-normal text-slate-600">{[fw.date, fw.location].filter(Boolean).join(' | ')}</span>
                </div>
                {fw.description && <p className="text-slate-800 leading-snug">{fw.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {show('languages') && languages.length > 0 && (
        <div className="break-inside-avoid">
          <h3 className={heading}>Proficiency in Language</h3>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className={variant === 'engineer' ? 'border-b border-black' : 'border-b border-slate-300'}>
                <th className="py-0.5 font-bold">Language</th>
                {LANGUAGE_COLS.map(([label]) => (
                  <th key={label} className="py-0.5 font-bold">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {languages.map(lang => (
                <tr key={lang.id} className="border-b border-slate-100">
                  <td className="py-0.5 font-semibold">{lang.language}</td>
                  {LANGUAGE_COLS.map(([label, key]) => (
                    <td key={label} className="py-0.5 text-slate-700">{lang[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {show('awards') && awards.length > 0 && (
        <div>
          <h3 className={heading}>Honors & Awards Received</h3>
          <div className="space-y-1.5">
            {awards.map(aw => (
              <div key={aw.id} className="break-inside-avoid">
                <div className="font-bold text-slate-900">{aw.title}</div>
                {aw.description && <div className="text-slate-700">{aw.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {show('activities') && activities.length > 0 && (
        <div>
          <h3 className={heading}>Extracurricular Activities / Leadership</h3>
          <div className="space-y-1.5">
            {activities.map(ac => (
              <div key={ac.id} className="flex justify-between break-inside-avoid">
                <div>
                  <span className="font-bold text-slate-900">{ac.title}</span>
                  {ac.organization && <span className="text-slate-700">, {ac.organization}</span>}
                </div>
                <span className="text-slate-600">{ac.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {show('details') && hasDetails && (
        <div className="break-inside-avoid">
          <h3 className={heading}>Personal Details</h3>
          <table className="w-full border-collapse">
            <tbody>
              {detailRows.map(([label, value]) => (
                <tr key={label} className="align-top">
                  <td className="py-0.5 pr-3 w-44 text-slate-600">{label}</td>
                  <td className="py-0.5 text-slate-900">: {value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {show('references') && references.length > 0 && (
        <div className="break-inside-avoid">
          <h3 className={heading}>References</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {references.map(rf => (
              <div key={rf.id} className="leading-snug">
                <div className="font-bold text-slate-900">{rf.name}</div>
                {rf.designation && <div className="text-slate-700">{rf.designation}</div>}
                {rf.organization && <div className="text-slate-700">{rf.organization}</div>}
                {rf.phone && <div className="text-slate-600">Phone: {rf.phone}</div>}
                {rf.email && <div className="text-slate-600">Email: {rf.email}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {show('declaration') && hasDeclaration && (
        <div className="break-inside-avoid pt-2 space-y-3">
          {declaration.text && (
            <div>
              <h3 className={heading}>Declaration</h3>
              <p className="text-slate-800 leading-snug">{declaration.text}</p>
            </div>
          )}
          <div className="pt-1">
            <p className="text-slate-700">Sincerely Yours</p>
            {declaration.signatureUrl && (
              <img src={declaration.signatureUrl} alt="Signature" className="h-16 w-48 object-contain object-left my-1" />
            )}
            <div className="w-40 border-t border-slate-500 pt-0.5 font-bold text-slate-900">
              {declaration.signerName || data.personalInfo.fullName}
            </div>
            {declaration.issuedDate && <div className="text-slate-500 text-[11px]">Issued: {declaration.issuedDate}</div>}
          </div>
        </div>
      )}
    </div>
  );
};
