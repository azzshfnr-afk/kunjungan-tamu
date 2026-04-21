declare module 'react-qr-scanner' {
    import { Component, CSSProperties } from 'react';

    export interface QrScannerProps {
        onScan: (data: { text: string } | null) => void;
        onError: (err: any) => void;
        onLoad?: () => void;
        onViewFinderResize?: (width: number, height: number) => void;
        delay?: number | false;
        style?: CSSProperties;
        className?: string;
        facingMode?: 'user' | 'environment';
        constraints?: MediaStreamConstraints;
        objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
        viewFinderProps?: any;
        flipped?: boolean;
        choosingFile?: boolean;
    }

    export default class QrScanner extends Component<QrScannerProps, any> {}
} 