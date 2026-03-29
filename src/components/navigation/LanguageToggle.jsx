import React from 'react';
import Button from '@mui/material/Button';

import { useLocale } from '../../i18n';

/**
 * LanguageToggle — 언어 전환 버튼
 *
 * 현재 언어의 반대 언어명을 표시하여 클릭 시 전환.
 * 우측 상단 고정 배치.
 *
 * Props: 없음 (useLocale 훅으로 상태 관리)
 *
 * Example usage:
 * <LanguageToggle />
 */
function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  const handleToggle = () => {
    setLocale(locale === 'ko' ? 'en' : 'ko');
  };

  return (
    <Button
      onClick={ handleToggle }
      variant="text"
      size="small"
      sx={ {
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1200,
        minWidth: 'auto',
        px: 1.5,
        py: 0.5,
        fontSize: '0.75rem',
        fontWeight: 500,
        color: 'text.secondary',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderRadius: '4px',
        letterSpacing: '0.02em',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: 'text.primary',
        },
      } }
    >
      { t('ui.langSwitch') }
    </Button>
  );
}

export { LanguageToggle };
