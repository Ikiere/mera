/**
 * MERA Smart Camera Presets
 * Pre-calibrated framing, orientation, aspect ratios, and studio advice.
 */

export interface CameraPreset {
  id: string;
  name: string;
  category: 'social' | 'longform' | 'education' | 'corporate' | 'cinematic';
  description: string;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  targetOrientation: 'portrait' | 'landscape';
  recommendedFps: 30 | 60 | 24;
  recommendedResolution: '1080p' | '4k' | '720p';
  framingGuidelines: {
    eyeLevelPercent: number; // Y position percentage (e.g. 0.33 for upper third)
    targetHeadroomRatio: number; // Ratio of headroom to total height
    maxSubjectWidthRatio: number; // Max horizontal width occupied by face/shoulders
    ruleOfThirds: boolean;
  };
  teleprompterDefaults: {
    layout: 'overlay' | 'split';
    fontSize: number;
    backdropOpacity: number;
    position: 'top' | 'middle' | 'bottom';
  };
  tips: string[];
}

export const SMART_PRESETS: CameraPreset[] = [
  {
    id: 'tiktok_reels',
    name: 'TikTok / Reels / Shorts',
    category: 'social',
    description: 'Vertical 9:16 format with high eye-line placement right under the front camera.',
    aspectRatio: '9:16',
    targetOrientation: 'portrait',
    recommendedFps: 30,
    recommendedResolution: '1080p',
    framingGuidelines: {
      eyeLevelPercent: 0.30,
      targetHeadroomRatio: 0.12,
      maxSubjectWidthRatio: 0.70,
      ruleOfThirds: true,
    },
    teleprompterDefaults: {
      layout: 'overlay',
      fontSize: 24,
      backdropOpacity: 0.75,
      position: 'top',
    },
    tips: [
      'Position teleprompter near the top of the screen to maintain direct eye contact with the lens.',
      'Leave space at the bottom 25% for social media UI overlays (captions, like buttons).',
      'Keep energy punchy and avoid looking away from the camera lens.',
    ],
  },
  {
    id: 'youtube_horizontal',
    name: 'YouTube Landscape',
    category: 'longform',
    description: 'Widescreen 16:9 format for standard YouTube videos, podcasts, and video essays.',
    aspectRatio: '16:9',
    targetOrientation: 'landscape',
    recommendedFps: 30,
    recommendedResolution: '1080p',
    framingGuidelines: {
      eyeLevelPercent: 0.33,
      targetHeadroomRatio: 0.15,
      maxSubjectWidthRatio: 0.50,
      ruleOfThirds: true,
    },
    teleprompterDefaults: {
      layout: 'split',
      fontSize: 22,
      backdropOpacity: 0.85,
      position: 'middle',
    },
    tips: [
      'Align eyes along the upper horizontal third line.',
      'Place camera at eye level on a tripod or stable ledge to avoid looking down.',
      'Ensure background has depth and lighting illuminates both sides of your face.',
    ],
  },
  {
    id: 'cinematic_talking_head',
    name: 'Cinematic Talking Head',
    category: 'cinematic',
    description: '24fps cinematic aesthetic with controlled rule-of-thirds framing and soft prompter pacing.',
    aspectRatio: '16:9',
    targetOrientation: 'landscape',
    recommendedFps: 24,
    recommendedResolution: '4k',
    framingGuidelines: {
      eyeLevelPercent: 0.35,
      targetHeadroomRatio: 0.14,
      maxSubjectWidthRatio: 0.45,
      ruleOfThirds: true,
    },
    teleprompterDefaults: {
      layout: 'overlay',
      fontSize: 26,
      backdropOpacity: 0.70,
      position: 'top',
    },
    tips: [
      'Lock exposure and white balance once framing is established.',
      'Step 3-5 feet away from the wall behind you to create natural background separation.',
      'Speak at a measured, conversational pace of ~130 words per minute.',
    ],
  },
  {
    id: 'online_course',
    name: 'Online Course / Lecture',
    category: 'education',
    description: 'Optimized for high readability, instructional clarity, and presentation pacing.',
    aspectRatio: '16:9',
    targetOrientation: 'landscape',
    recommendedFps: 30,
    recommendedResolution: '1080p',
    framingGuidelines: {
      eyeLevelPercent: 0.33,
      targetHeadroomRatio: 0.16,
      maxSubjectWidthRatio: 0.55,
      ruleOfThirds: true,
    },
    teleprompterDefaults: {
      layout: 'split',
      fontSize: 24,
      backdropOpacity: 0.90,
      position: 'top',
    },
    tips: [
      'Split mode keeps your notes clearly visible while monitoring your posture.',
      'Pause slightly after key concepts; MERA will hold your place automatically.',
      'Ensure clear vocal articulation for crisp student comprehension.',
    ],
  },
  {
    id: 'business_presentation',
    name: 'Executive & Pitch Video',
    category: 'corporate',
    description: 'Formal framing, clean background contrast, and confident eye-level delivery.',
    aspectRatio: '16:9',
    targetOrientation: 'landscape',
    recommendedFps: 30,
    recommendedResolution: '1080p',
    framingGuidelines: {
      eyeLevelPercent: 0.32,
      targetHeadroomRatio: 0.15,
      maxSubjectWidthRatio: 0.50,
      ruleOfThirds: true,
    },
    teleprompterDefaults: {
      layout: 'overlay',
      fontSize: 24,
      backdropOpacity: 0.80,
      position: 'top',
    },
    tips: [
      'Dress in solid colors contrasting with your background.',
      'Check audio levels carefully before starting your pitch.',
      'Maintain an upright posture with shoulders relaxed.',
    ],
  },
];

export function getPresetById(id: string): CameraPreset {
  const found = SMART_PRESETS.find(p => p.id === id);
  return found || SMART_PRESETS[0];
}
