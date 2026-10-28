import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Mail, Phone, MapPin, Printer } from 'lucide-react';
import { ResumeExtraSections } from './ResumeExtraSections';

// Format the project / client / location line shown under an experience heading
const experienceMeta = (exp) =>
  [exp.project && `Project: ${exp.project}`, exp.client && `Client: ${exp.client}`, exp.location].filter(Boolean).join(' • ');

// Render printable formatted multi-template resume preview canvas
export const ResumePreview = ({ data, onPrint }) => {
  const { personalInfo, experience, education, skills, settings } = data;

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Canvas Bar (hidden during print) */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-foreground">Live Document Canvas</span>
          <span>•</span>
          <span className="text-[11px]">A4 Vector Print Ready</span>
        </div>

        <button
          onClick={onPrint}
          className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </button>
      </div>

      {/* Printable A4 Paper Wrapper */}
      <PrintablePaper id="printable-resume-canvas">
        
        {/* TEMPLATE 1: MODERN EXECUTIVE */}
        {settings.template === 'modern-executive' && (
          <div className="space-y-6">
            <div
              className="p-6 rounded-xl text-white space-y-2"
              style={{ backgroundColor: settings.accentColor || '#d87943' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold tracking-tight">{personalInfo.fullName}</h1>
                  <p className="text-sm font-medium text-slate-100">{personalInfo.title}</p>
                </div>
                {personalInfo.avatarUrl && (
                  <img src={personalInfo.avatarUrl} alt="" className="w-24 h-28 object-cover rounded-lg border-2 border-white/60 shrink-0" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-100 pt-2 border-t border-white/20">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {personalInfo.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {personalInfo.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {personalInfo.location}</span>
              </div>
            </div>

            {personalInfo.summary && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-0.5">
                  Executive Profile
                </h3>
                <p className="text-xs text-slate-800 leading-relaxed text-justify">{personalInfo.summary}</p>
              </div>
            )}

            {experience.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-0.5">
                  Work Experience & Leadership
                </h3>

                {experience.map(exp => (
                  <div key={exp.id} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{exp.role} <span className="font-normal text-slate-600">at {exp.company}</span></span>
                      <span className="text-slate-600 font-normal">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                    </div>
                    {experienceMeta(exp) && <div className="text-[11px] text-slate-500">{experienceMeta(exp)}</div>}
                    <ul className="list-disc list-inside space-y-1 text-slate-800 pl-1">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="leading-snug">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              {skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold uppercase tracking-wider border-b-2 border-slate-900 pb-0.5 text-slate-900 text-xs">
                    Key Competencies
                  </h3>
                  {skills.map(sg => (
                    <div key={sg.id}>
                      <span className="font-bold text-slate-900">{sg.category}: </span>
                      <span className="text-slate-700">{sg.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              )}

              {education.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold uppercase tracking-wider border-b-2 border-slate-900 pb-0.5 text-slate-900 text-xs">
                    Education & Credentials
                  </h3>
                  {education.map(edu => (
                    <div key={edu.id} className="space-y-0.5">
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-slate-700">
                        {edu.institution}{edu.location ? `, ${edu.location}` : ''}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {edu.startDate ? `${edu.startDate} – ` : ''}{edu.endDate || 'Present'}{edu.grade ? ` • ${edu.grade}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ResumeExtraSections data={data} variant="modern" />
          </div>
        )}

        {/* TEMPLATE 2: CLASSIC PROFESSIONAL */}
        {settings.template === 'classic-professional' && (
          <div className="space-y-5 text-slate-900 font-serif">
            <div className="text-center border-b-2 border-slate-900 pb-3">
              {personalInfo.avatarUrl && (
                <img src={personalInfo.avatarUrl} alt="" className="w-24 h-28 object-cover rounded-md border border-slate-300 mx-auto mb-2" />
              )}
              <h1 className="text-2xl font-bold tracking-wide uppercase">{personalInfo.fullName}</h1>
              <p className="text-xs italic text-slate-700 mt-0.5">{personalInfo.title}</p>
              <div className="text-xs text-slate-600 mt-1 space-x-2 font-sans">
                <span>{personalInfo.email}</span>
                <span>•</span>
                <span>{personalInfo.phone}</span>
                <span>•</span>
                <span>{personalInfo.location}</span>
              </div>
            </div>

            {personalInfo.summary && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest border-b border-slate-400 pb-0.5 mb-1.5 font-sans">
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-800 leading-relaxed text-justify">{personalInfo.summary}</p>
              </div>
            )}

            {experience.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest border-b border-slate-400 pb-0.5 mb-2 font-sans">
                  Professional History
                </h2>
                <div className="space-y-3 text-xs">
                  {experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex justify-between font-bold">
                        <span>{exp.role}, {exp.company}</span>
                        <span className="font-normal italic text-slate-600 font-sans">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                      </div>
                      {experienceMeta(exp) && <div className="text-[11px] text-slate-500 font-sans">{experienceMeta(exp)}</div>}
                      <ul className="list-disc list-inside space-y-1 text-slate-800 pt-1 font-sans">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest border-b border-slate-400 pb-0.5 mb-2 font-sans">
                  Key Skills & Competencies
                </h2>
                <div className="space-y-1.5 text-xs font-sans">
                  {skills.map(sg => (
                    <div key={sg.id} className="text-slate-800">
                      <span className="font-bold text-slate-900 font-serif">{sg.category}: </span>
                      <span>{sg.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest border-b border-slate-400 pb-0.5 mb-2 font-sans">
                  Education & Credentials
                </h2>
                <div className="space-y-2.5 text-xs">
                  {education.map(edu => (
                    <div key={edu.id} className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900">{edu.degree}</div>
                        <div className="text-slate-700 italic font-sans">{edu.institution}{edu.location ? ` • ${edu.location}` : ''}</div>
                        {edu.grade && <div className="text-[11px] text-slate-600 font-sans">Grade / Honors: {edu.grade}</div>}
                      </div>
                      <span className="text-slate-600 font-sans text-xs">
                        {edu.startDate ? `${edu.startDate} – ` : ''}{edu.endDate || 'Present'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ResumeExtraSections data={data} variant="classic" />
          </div>
        )}

        {/* TEMPLATE 3: TECHNICAL MINIMALIST */}
        {settings.template === 'technical-minimal' && (
          <div className="space-y-4 font-mono text-xs text-slate-900">
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold uppercase">{personalInfo.fullName}</h1>
                <p className="text-xs text-slate-700 font-semibold">{personalInfo.title}</p>
                <div className="text-[11px] text-slate-600 mt-1">
                  {personalInfo.email} | {personalInfo.phone} | {personalInfo.location}
                </div>
              </div>
              {personalInfo.avatarUrl && (
                <img src={personalInfo.avatarUrl} alt="" className="w-20 h-24 object-cover border border-slate-400 shrink-0" />
              )}
            </div>

            {personalInfo.summary && (
              <div>
                <div className="font-bold uppercase border-b border-slate-400 mb-1">SUMMARY</div>
                <p className="text-[11px] leading-relaxed text-slate-800">{personalInfo.summary}</p>
              </div>
            )}

            {experience.length > 0 && (
              <div>
                <div className="font-bold uppercase border-b border-slate-400 mb-2">EXPERIENCE</div>
                <div className="space-y-3">
                  {experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex justify-between font-bold">
                        <span>{exp.role} @ {exp.company}</span>
                        <span>{exp.startDate} - {exp.isCurrent ? 'NOW' : exp.endDate}</span>
                      </div>
                      {experienceMeta(exp) && <div className="text-[11px] text-slate-500">{experienceMeta(exp)}</div>}
                      <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-800">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <div>
                <div className="font-bold uppercase border-b border-slate-400 mb-2">SKILLS & TECH STACK</div>
                <div className="space-y-1 text-[11px]">
                  {skills.map(sg => (
                    <div key={sg.id}>
                      <span className="font-bold">[{sg.category}]: </span>
                      <span>{sg.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education.length > 0 && (
              <div>
                <div className="font-bold uppercase border-b border-slate-400 mb-2">EDUCATION & CREDENTIALS</div>
                <div className="space-y-2 text-[11px]">
                  {education.map(edu => (
                    <div key={edu.id} className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">{edu.degree}</div>
                        <div className="text-slate-700">{edu.institution}{edu.location ? ` [${edu.location}]` : ''}</div>
                        {edu.grade && <div className="text-slate-600">Result: {edu.grade}</div>}
                      </div>
                      <span className="text-slate-600">
                        {edu.startDate ? `${edu.startDate} - ` : ''}{edu.endDate || 'NOW'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ResumeExtraSections data={data} variant="technical" />
          </div>
        )}

        {/* TEMPLATE 4: ENGINEER (black only) */}
        {settings.template === 'engineer' && (
          <div className="space-y-3.5 text-xs text-black [&_*]:text-black">
            <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-2.5">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-wide">{personalInfo.fullName}</h1>
                <p className="text-sm font-bold mt-0.5">{personalInfo.title}</p>
                <div className="text-[11.5px] mt-1.5 leading-snug">
                  {personalInfo.location && <div>{personalInfo.location}</div>}
                  <div>{[personalInfo.phone, personalInfo.email].filter(Boolean).join('  |  ')}</div>
                </div>
              </div>
              {personalInfo.avatarUrl && (
                <img src={personalInfo.avatarUrl} alt="" className="w-[92px] h-[112px] object-cover border border-black shrink-0" />
              )}
            </div>

            {personalInfo.summary && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Professional Summary / Career Objective</h3>
                <p className="leading-snug">{personalInfo.summary}</p>
              </div>
            )}

            {education.length > 0 && (
              <div className="break-inside-avoid">
                <h3 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Education</h3>
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      {['Certificate', 'Institution', 'GPA/CGPA', 'Passing Year'].map(h => (
                        <th key={h} className="border border-black px-1.5 py-0.5 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {education.map(edu => (
                      <tr key={edu.id} className="align-top">
                        <td className="border border-black px-1.5 py-0.5">{edu.degree}</td>
                        <td className="border border-black px-1.5 py-0.5">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</td>
                        <td className="border border-black px-1.5 py-0.5">{edu.grade}</td>
                        <td className="border border-black px-1.5 py-0.5">{edu.endDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <ResumeExtraSections data={data} variant="engineer" sections={['thesis', 'fieldwork', 'languages']} />

            {skills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Technical Skills</h3>
                {skills.map(sg => (
                  <p key={sg.id}><span className="font-bold">{sg.category}: </span>{sg.items.join(', ')}</p>
                ))}
              </div>
            )}

            {experience.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Internships / Work Experience</h3>
                <div className="space-y-2.5">
                  {experience.map(exp => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex justify-between gap-3">
                        <span className="font-bold">{exp.role} | {exp.company}</span>
                        <span className="text-[11px] shrink-0">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}{exp.location ? ` | ${exp.location}` : ''}</span>
                      </div>
                      {(exp.project || exp.client) && (
                        <div className="text-[11px]">
                          {[exp.project && `Project: ${exp.project}`, exp.client && `Client: ${exp.client}`].filter(Boolean).join(' • ')}
                        </div>
                      )}
                      <ul className="list-disc ml-5 space-y-0.5 mt-0.5">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ResumeExtraSections
              data={data}
              variant="engineer"
              sections={['awards', 'activities', 'details', 'references', 'declaration']}
            />
          </div>
        )}

      </PrintablePaper>
    </div>
  );
};
