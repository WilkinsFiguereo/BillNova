import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

type IconProps = { size?: number; color?: string; strokeWidth?: number };

export function IconUser({ size = 16, color = '#8896B0', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function IconMail({ size = 16, color = '#8896B0', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M2 8l10 7 10-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function IconLock({ size = 16, color = '#8896B0', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="12" cy="16" r="1.5" fill={color} />
    </Svg>
  );
}

export function IconPhone({ size = 16, color = '#8896B0', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="18" r="1" fill={color} />
    </Svg>
  );
}

export function IconMapPin({ size = 16, color = '#8896B0', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.7 2 6 4.7 6 8c0 4.5 6 14 6 14s6-9.5 6-14c0-3.3-2.7-6-6-6z" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="8" r="2" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function IconAt({ size = 16, color = '#8896B0', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M16 12v2a3 3 0 006 0v-2a10 10 0 10-4 8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function IconEye({ size = 16, color = '#C5CFDF', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1 12C3 6 7 3 12 3s9 3 11 9c-2 6-6 9-11 9S3 18 1 12z" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function IconEyeOff({ size = 16, color = '#C5CFDF', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17.9 17.9A10 10 0 0112 20C7 20 3 17 1 12c1-3 3-5.5 5.1-7.1M9.9 4.2A10 10 0 0123 12c-.5 1.6-1.4 3-2.5 4.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M3 3l18 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function IconArrowRight({ size = 12, color = '#fff', strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconBriefcase({ size = 18, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="9" width="20" height="13" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M8 9V7a4 4 0 018 0v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M2 14h20" stroke={color} strokeWidth={strokeWidth} strokeOpacity={0.45} />
    </Svg>
  );
}

export function IconShield({ size = 16, color = '#8896B0', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 6v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V6L12 2z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconWarning({ size = 12, color = '#DC2626', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 7v5M12 16v1" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export function IconCheck({ size = 16, color = '#059669', strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Official Google "G" logo
export function IconGoogle({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.2 0 5.9 1.1 8.1 2.9l6-6C34.4 3.2 29.5 1 24 1 14.8 1 7 6.7 3.7 14.6l7 5.4C12.4 13.4 17.7 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.2-9.9 7.2-16.9z" />
      <Path fill="#FBBC05" d="M10.7 28.6A14.6 14.6 0 019.5 24c0-1.6.3-3.1.8-4.6l-7-5.4A23.9 23.9 0 000 24c0 3.9.9 7.5 2.6 10.8l8.1-6.2z" />
      <Path fill="#34A853" d="M24 47c5.5 0 10.1-1.8 13.5-4.9l-7.4-5.7c-1.8 1.2-4.1 2-6.1 2-6.3 0-11.6-4-13.3-9.4l-8.1 6.2C7 40.2 14.8 47 24 47z" />
    </Svg>
  );
}