import injamulResume from './injamulResume.json';

// Provide default initial resume dataset, prefilled from injamulResume.json
export const getDefaultResumeData = () => JSON.parse(JSON.stringify(injamulResume));

export const SAMPLE_RESUME = getDefaultResumeData();
