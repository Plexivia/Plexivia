import React, { useState } from 'react';
import { User, Briefcase, GraduationCap, Wrench, Settings, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Render interactive form controls for resume sections and styling
export const ResumeForm = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState('personal');

  const handlePersonalChange = (field, value) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: 'New Company',
      role: 'Job Role',
      location: 'City',
      startDate: '2023-01',
      endDate: 'Present',
      isCurrent: true,
      bullets: ['Key responsibility or achievement statement.']
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const handleUpdateExperience = (id, field, value) => {
    onChange({
      ...data,
      experience: data.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const handleRemoveExperience = (id) => {
    onChange({
      ...data,
      experience: data.experience.filter(e => e.id !== id)
    });
  };

  const handleAddBullet = (expId) => {
    onChange({
      ...data,
      experience: data.experience.map(e => {
        if (e.id === expId) {
          return { ...e, bullets: [...e.bullets, 'New achievement point'] };
        }
        return e;
      })
    });
  };

  const handleUpdateBullet = (expId, index, value) => {
    onChange({
      ...data,
      experience: data.experience.map(e => {
        if (e.id === expId) {
          const updated = [...e.bullets];
          updated[index] = value;
          return { ...e, bullets: updated };
        }
        return e;
      })
    });
  };

  const handleRemoveBullet = (expId, index) => {
    onChange({
      ...data,
      experience: data.experience.map(e => {
        if (e.id === expId) {
          return { ...e, bullets: e.bullets.filter((_, i) => i !== index) };
        }
        return e;
      })
    });
  };

  const handleAddEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: 'B.Sc. / Degree Title',
      institution: 'University / Institute Name',
      location: 'City, Country',
      startDate: '2019',
      endDate: '2023',
      grade: 'CGPA 3.8 / 4.0'
    };
    onChange({
      ...data,
      education: [...(data.education || []), newEdu]
    });
  };

  const handleUpdateEducation = (id, field, value) => {
    onChange({
      ...data,
      education: (data.education || []).map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const handleRemoveEducation = (id) => {
    onChange({
      ...data,
      education: (data.education || []).filter(e => e.id !== id)
    });
  };

  const handleAddSkillCategory = () => {
    const newSkill = {
      id: `skill-${Date.now()}`,
      category: 'New Skill Category',
      items: ['Skill 1', 'Skill 2']
    };
    onChange({
      ...data,
      skills: [...(data.skills || []), newSkill]
    });
  };

  const handleUpdateSkillCategory = (id, field, value) => {
    onChange({
      ...data,
      skills: (data.skills || []).map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const handleRemoveSkillCategory = (id) => {
    onChange({
      ...data,
      skills: (data.skills || []).filter(s => s.id !== id)
    });
  };

  const handleSkillItemsChange = (id, commaSeparatedString) => {
    const items = commaSeparatedString.split(',').map(item => item.trim()).filter(Boolean);
    onChange({
      ...data,
      skills: (data.skills || []).map(s => s.id === id ? { ...s, items } : s)
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-5">
      {/* Form Section Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {[
          { id: 'personal', label: 'Personal', icon: User },
          { id: 'experience', label: 'Experience', icon: Briefcase },
          { id: 'education', label: 'Education', icon: GraduationCap },
          { id: 'skills', label: 'Skills', icon: Wrench },
          { id: 'settings', label: 'Template', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PERSONAL INFO */}
      {activeTab === 'personal' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={data.personalInfo.fullName}
                onChange={e => handlePersonalChange('fullName', e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-medium mb-1">Professional Title</label>
              <input
                type="text"
                value={data.personalInfo.title}
                onChange={e => handlePersonalChange('title', e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={data.personalInfo.email}
                onChange={e => handlePersonalChange('email', e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={data.personalInfo.phone}
                onChange={e => handlePersonalChange('phone', e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-muted-foreground font-medium mb-1">Location / Address</label>
              <input
                type="text"
                value={data.personalInfo.location}
                onChange={e => handlePersonalChange('location', e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-muted-foreground font-medium mb-1">Professional Executive Summary</label>
              <textarea
                rows={4}
                value={data.personalInfo.summary}
                onChange={e => handlePersonalChange('summary', e.target.value)}
                className="w-full bg-background border border-input rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORK EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Work Experience</h3>
            <button
              onClick={handleAddExperience}
              className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Position</span>
            </button>
          </div>

          {data.experience.map((exp, index) => (
            <div key={exp.id} className="bg-muted/40 border border-border p-3.5 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-foreground">Position #{index + 1}</span>
                <button
                  onClick={() => handleRemoveExperience(exp.id)}
                  className="text-destructive hover:text-destructive/80 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Remove Position"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-muted-foreground mb-0.5">Job Role</label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={e => handleUpdateExperience(exp.id, 'role', e.target.value)}
                    className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-0.5">Company Name</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={e => handleUpdateExperience(exp.id, 'company', e.target.value)}
                    className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-0.5">Start Date</label>
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={e => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                    className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-0.5">End Date</label>
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={e => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                    className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                  />
                </div>
              </div>

              {/* Bullet Points */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground text-[11px]">Key Accomplishments</span>
                  <button
                    onClick={() => handleAddBullet(exp.id)}
                    className="text-primary hover:underline text-[11px] font-medium"
                  >
                    + Add Bullet
                  </button>
                </div>

                {exp.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={b}
                      onChange={e => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                      className="flex-1 bg-background border border-input rounded-lg px-2.5 py-1 text-foreground text-[11px] outline-none"
                    />
                    <button
                      onClick={() => handleRemoveBullet(exp.id, bIdx)}
                      className="text-destructive hover:text-destructive/80 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* TAB 3: EDUCATION */}
      {activeTab === 'education' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Education & Qualifications</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Add degrees, diplomas, university credentials, or professional certifications.</p>
            </div>
            <button
              type="button"
              onClick={handleAddEducation}
              className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education</span>
            </button>
          </div>

          {(data.education || []).length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-border rounded-xl bg-muted/20">
              <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-foreground">No education history added yet</p>
              <p className="text-[11px] text-muted-foreground mt-1 mb-3">Include your degrees, institutions, graduation dates and GPA or honors.</p>
              <button
                type="button"
                onClick={handleAddEducation}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-3.5 py-1.5 rounded-lg text-xs shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Degree / Certificate</span>
              </button>
            </div>
          ) : (
            (data.education || []).map((edu, idx) => (
              <div key={edu.id} className="bg-muted/40 border border-border p-3.5 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-bold text-foreground">Qualification #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="text-destructive hover:text-destructive/80 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Remove Degree"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Degree Title</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Sc. in Computer Science & Engineering"
                      value={edu.degree || ''}
                      onChange={e => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                      className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Institution / University</label>
                    <input
                      type="text"
                      placeholder="e.g. University of Dhaka"
                      value={edu.institution || ''}
                      onChange={e => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                      className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Location / Campus</label>
                    <input
                      type="text"
                      placeholder="e.g. Dhaka, Bangladesh"
                      value={edu.location || ''}
                      onChange={e => handleUpdateEducation(edu.id, 'location', e.target.value)}
                      className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Grade / Result / Honors</label>
                    <input
                      type="text"
                      placeholder="e.g. CGPA 3.85 / 4.0 or First Class"
                      value={edu.grade || ''}
                      onChange={e => handleUpdateEducation(edu.id, 'grade', e.target.value)}
                      className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Start Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2017"
                      value={edu.startDate || ''}
                      onChange={e => handleUpdateEducation(edu.id, 'startDate', e.target.value)}
                      className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">End / Passing Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2021 or Present"
                      value={edu.endDate || ''}
                      onChange={e => handleUpdateEducation(edu.id, 'endDate', e.target.value)}
                      className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: SKILLS */}
      {activeTab === 'skills' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Skills & Competencies</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Organize your expertise by domain, tools, frameworks or languages.</p>
            </div>
            <button
              type="button"
              onClick={handleAddSkillCategory}
              className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill Group</span>
            </button>
          </div>

          {(data.skills || []).length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-border rounded-xl bg-muted/20">
              <Wrench className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-foreground">No skill categories added yet</p>
              <p className="text-[11px] text-muted-foreground mt-1 mb-3">Group your skills into categories like Frontend, Backend, Cloud or Management.</p>
              <button
                type="button"
                onClick={handleAddSkillCategory}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-3.5 py-1.5 rounded-lg text-xs shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill Category</span>
              </button>
            </div>
          ) : (
            (data.skills || []).map((sg, idx) => (
              <div key={sg.id} className="bg-muted/40 border border-border p-3.5 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-bold text-foreground">Skill Group #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillCategory(sg.id)}
                    className="text-destructive hover:text-destructive/80 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Remove Skill Group"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Development, Tools & Cloud, Languages"
                      value={sg.category || ''}
                      onChange={e => handleUpdateSkillCategory(sg.id, 'category', e.target.value)}
                      className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-medium mb-1">
                      Skill Items <span className="font-normal text-muted-foreground/75">(Comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. React, Next.js, TypeScript, Tailwind CSS"
                      value={(sg.items || []).join(', ')}
                      onChange={e => handleSkillItemsChange(sg.id, e.target.value)}
                      className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                    />
                  </div>

                  {(sg.items || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(sg.items || []).map((item, itemIdx) => (
                        <span
                          key={itemIdx}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-background border border-border text-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: SETTINGS & TEMPLATES */}
      {activeTab === 'settings' && (
        <div className="space-y-5 text-xs">
          <div>
            <label className="block text-muted-foreground font-medium mb-2">Design Template</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'modern-executive', label: 'Modern Executive', desc: 'Header banner with accent color' },
                { id: 'classic-professional', label: 'Classic Professional', desc: 'Elegant traditional serif typography' },
                { id: 'technical-minimal', label: 'Technical Minimalist', desc: 'Monospace, compact developer grid' }
              ].map(tmpl => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => onChange({ ...data, settings: { ...data.settings, template: tmpl.id } })}
                  className={`p-3 border rounded-xl text-left transition-all cursor-pointer ${
                    data.settings.template === tmpl.id
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border bg-background hover:bg-muted/50'
                  }`}
                >
                  <div className="font-bold text-foreground">{tmpl.label}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{tmpl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground font-medium mb-2">Accent Color Theme</label>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { label: 'Sky Blue', hex: '#0284c7' },
                { label: 'Emerald', hex: '#059669' },
                { label: 'Indigo', hex: '#4f46e5' },
                { label: 'Violet', hex: '#7c3aed' },
                { label: 'Rose', hex: '#e11d48' },
                { label: 'Amber', hex: '#d97706' },
                { label: 'Slate', hex: '#334155' },
              ].map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => onChange({ ...data, settings: { ...data.settings, accentColor: c.hex } })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    data.settings.accentColor === c.hex
                      ? 'border-foreground font-bold shadow-xs'
                      : 'border-border hover:border-foreground/50'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }}></span>
                  <span className="text-foreground">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
