export function getDefaultResumeData() {
  return {
    personalInfo: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      avatarUrl: ""
    },
    experience: [],
    education: [],
    skills: [],
    settings: {
      template: "modern-executive", // 'modern-executive' | 'classic-professional' | 'technical-minimal'
      accentColor: "#0284c7"
    }
  };
}

export const SAMPLE_RESUME = getDefaultResumeData();

