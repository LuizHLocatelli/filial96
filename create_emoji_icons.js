const fs = require('fs');
const path = require('path');

const icons = [
  'Activity', 'AlertCircle', 'AlertTriangle', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowRightLeft', 'Award', 'Baby', 'BarChart3', 'Bell', 'BookOpen', 'Bot', 'Box', 'Building2', 'Calculator', 'Calendar', 'CalendarCog', 'CalendarDays', 'CalendarIcon', 'Camera', 'CameraOff', 'Check', 'CheckCircle', 'CheckCircle2', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'Circle', 'Clock', 'ClockIcon', 'Copy', 'Crown', 'Database', 'DollarSign', 'Download', 'Edit', 'Edit2', 'Edit3', 'ExternalLink', 'Eye', 'EyeOff', 'File', 'FileDown', 'FileImage', 'FileSpreadsheet', 'FileText', 'Filter', 'Folder', 'FolderOpen', 'FolderPlus', 'Gift', 'Globe', 'GraduationCap', 'History', 'Home', 'Image', 'ImageIcon', 'ImagePlus', 'ImageUp', 'Info', 'InfinityIcon', 'Key', 'LayoutGrid', 'LayoutList', 'Loader2', 'Lock', 'LogIn', 'Mail', 'MapPin', 'MessageSquare', 'Mic', 'Moon', 'MoreHorizontal', 'MoreVertical', 'Package', 'Paperclip', 'Pause', 'Pencil', 'Phone', 'Play', 'Plus', 'PlusCircle', 'Radio', 'RefreshCcw', 'RefreshCw', 'RotateCcw', 'RotateCw', 'Save', 'Search', 'Send', 'Settings', 'Share2', 'Shield', 'ShoppingBag', 'Smartphone', 'Sparkles', 'Square', 'Star', 'Sun', 'Tag', 'Target', 'Trash2', 'TrendingDown', 'TrendingUp', 'Truck', 'Upload', 'UploadCloud', 'User', 'UserCircle', 'UserPlus', 'Users', 'Volume2', 'VolumeX', 'Wand2', 'Wrench', 'X', 'XCircle', 'Zap', 'ZoomIn', 'ZoomOut',
  'FileIcon'
];

const emojiMap = {
  Activity: '📈', AlertCircle: '🔴', AlertTriangle: '⚠️', ArrowDown: '⬇️', ArrowLeft: '⬅️', ArrowRight: '➡️', ArrowRightLeft: '↔️', Award: '🏆', Baby: '👶', BarChart3: '📊', Bell: '🔔', BookOpen: '📖', Bot: '🤖', Box: '📦', Building2: '🏢', Calculator: '🧮', Calendar: '📅', CalendarCog: '🗓️', CalendarDays: '📆', CalendarIcon: '📅', Camera: '📷', CameraOff: '🚫📷', Check: '✔️', CheckCircle: '✅', CheckCircle2: '☑️', ChevronDown: '🔽', ChevronLeft: '◀️', ChevronRight: '▶️', ChevronUp: '🔼', Circle: '⭕', Clock: '🕒', ClockIcon: '🕒', Copy: '📋', Crown: '👑', Database: '🗄️', DollarSign: '💵', Download: '📥', Edit: '✏️', Edit2: '📝', Edit3: '✍️', ExternalLink: '↗️', Eye: '👁️', EyeOff: '🙈', File: '📄', FileDown: '⏬', FileImage: '🖼️', FileSpreadsheet: '📗', FileText: '📝', FileIcon: '📄', Filter: '🎛️', Folder: '📁', FolderOpen: '📂', FolderPlus: '📁+', Gift: '🎁', Globe: '🌐', GraduationCap: '🎓', History: '🕰️', Home: '🏠', Image: '🖼️', ImageIcon: '🖼️', ImagePlus: '🖼️+', ImageUp: '🖼️^', Info: 'ℹ️', InfinityIcon: '♾️', Key: '🔑', LayoutGrid: '🔲', LayoutList: '☰', Loader2: '⏳', Lock: '🔒', LogIn: '🚪', Mail: '✉️', MapPin: '📍', MessageSquare: '💬', Mic: '🎤', Moon: '🌙', MoreHorizontal: '⋯', MoreVertical: '⋮', Package: '📦', Paperclip: '📎', Pause: '⏸️', Pencil: '✏️', Phone: '📞', Play: '▶️', Plus: '➕', PlusCircle: '⊕', Radio: '📻', RefreshCcw: '🔄', RefreshCw: '🔃', RotateCcw: '↺', RotateCw: '↻', Save: '💾', Search: '🔍', Send: '📤', Settings: '⚙️', Share2: '🔗', Shield: '🛡️', ShoppingBag: '🛍️', Smartphone: '📱', Sparkles: '✨', Square: '🟩', Star: '⭐', Sun: '☀️', Tag: '🏷️', Target: '🎯', Trash2: '🗑️', TrendingDown: '📉', TrendingUp: '📈', Truck: '🚚', Upload: '📤', UploadCloud: '☁️', User: '👤', UserCircle: '🧑', UserPlus: '👤+', Users: '👥', Volume2: '🔊', VolumeX: '🔇', Wand2: '🪄', Wrench: '🔧', X: '❌', XCircle: '🚫', Zap: '⚡', ZoomIn: '🔍+', ZoomOut: '🔍-'
};

const componentsContent = icons.map(icon => {
  const emoji = emojiMap[icon] || '❓';
  return `export const ${icon} = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? \`\${size}px\` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? \`\${size}px\` : size,
          height: typeof size === 'number' ? \`\${size}px\` : size,
        }}
        {...props}
      >
        ${emoji}
      </span>
    );
  }
);
${icon}.displayName = '${icon}';
`;
}).join('\n');

const fileContent = `import * as React from 'react';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  size?: string | number;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}

export type LucideIcon = React.ElementType<IconProps>;
export type IconName = string;
export type IconeContextual = React.ElementType<IconProps>;

${componentsContent}
`;

fs.writeFileSync(path.join(__dirname, 'src/components/ui/emoji-icons.tsx'), fileContent);
console.log('src/components/ui/emoji-icons.tsx created successfully.');
