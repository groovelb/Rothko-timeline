import React from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { X } from 'lucide-react';

import { useLocale } from '../../i18n';
import { getColorName } from '../../utils/colorName';

/** 밴드 ID → locale 키 */
const BAND_KEY = {
  EXPAND: 'band.expand',
  RADIATE: 'band.radiate',
  EQUIL: 'band.equil',
  CONTRACT: 'band.contract',
  VOID: 'band.void',
};

/**
 * ColorDetailModal — 색상 세그먼트 상세 모달
 *
 * Props:
 * @param {boolean} open - 모달 열림 여부 [Required]
 * @param {function} onClose - 닫기 콜백 [Required]
 * @param {Object|null} segment - 선택된 세그먼트 { color, pct, bands, works } [Optional]
 *
 * Example usage:
 * <ColorDetailModal open={!!seg} onClose={close} segment={seg} />
 */
function ColorDetailModal({ open, onClose, segment }) {
  const { t, localized } = useLocale();

  if (!segment) return null;

  const { color, pct, bands = [], works = [] } = segment;
  const colorName = localized(getColorName(color));
  const totalBandCount = bands.reduce((s, b) => s + b.count, 0);

  return (
    <Dialog
      open={ open }
      onClose={ onClose }
      maxWidth="md"
      fullWidth
      scroll="paper"
      slotProps={ {
        paper: {
          sx: {
            borderRadius: 0,
            maxHeight: '85vh',
            width: { xs: '95vw', md: '720px', lg: '840px' },
          },
        },
        backdrop: {
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
        },
      } }
    >
      <DialogContent sx={ { p: 0 } }>
        {/* 헤더 — 색상 + 비율 + 닫기 */}
        <Box
          sx={ {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 3, md: 4 },
            py: { xs: 2.5, md: 3 },
            borderBottom: '1px solid',
            borderColor: 'grey.100',
          } }
        >
          <Box sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
            <Box
              sx={ {
                width: 32,
                height: 32,
                backgroundColor: color,
                borderRadius: '2px',
                flexShrink: 0,
              } }
            />
            <Box>
              <Typography
                variant="subtitle1"
                sx={ { fontWeight: 600, lineHeight: 1.2 } }
              >
                { colorName }
              </Typography>
              <Typography
                variant="caption"
                sx={ { color: 'text.disabled' } }
              >
                { t('ui.ofTotal') } { (pct * 100).toFixed(1) }%
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={ onClose } size="small">
            <X size={ 18 } />
          </IconButton>
        </Box>

        {/* 감성 분포 */}
        <Box sx={ { px: { xs: 3, md: 4 }, py: { xs: 2.5, md: 3 }, borderBottom: '1px solid', borderColor: 'grey.100' } }>
          <Typography
            variant="body2"
            sx={ { fontWeight: 600, mb: 1.5, color: 'text.secondary' } }
          >
            { t('ui.emotionDist') }
          </Typography>

          {/* 가로 비율 바 */}
          <Box
            sx={ {
              display: 'flex',
              height: 8,
              borderRadius: '4px',
              overflow: 'hidden',
              mb: 1.5,
            } }
          >
            { bands.map((b) => (
              <Box
                key={ b.id }
                sx={ {
                  width: `${totalBandCount > 0 ? (b.count / totalBandCount) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: color,
                  opacity: 0.3 + (b.count / totalBandCount) * 0.7,
                  minWidth: '2px',
                } }
              />
            )) }
          </Box>

          {/* 밴드 라벨 */}
          <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
            { bands.map((b) => (
              <Box
                key={ b.id }
                sx={ {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.25,
                  backgroundColor: 'grey.50',
                  borderRadius: '2px',
                } }
              >
                <Typography variant="caption" sx={ { fontWeight: 500, color: 'text.secondary' } }>
                  { t(BAND_KEY[b.id]) }
                </Typography>
                <Typography variant="caption" sx={ { color: 'text.disabled' } }>
                  { b.count }
                </Typography>
              </Box>
            )) }
          </Box>
        </Box>

        {/* 작품 그리드 */}
        <Box sx={ { px: { xs: 3, md: 4 }, py: { xs: 2.5, md: 3 } } }>
          <Typography
            variant="body2"
            sx={ { fontWeight: 600, mb: 1.5, color: 'text.secondary' } }
          >
            { t('ui.worksWithColor') } ({ works.length })
          </Typography>

          <Box
            sx={ {
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(auto-fill, minmax(100px, 1fr))',
                md: 'repeat(auto-fill, minmax(140px, 1fr))',
                lg: 'repeat(auto-fill, minmax(160px, 1fr))',
              },
              gap: { xs: 1.5, md: 2.5 },
            } }
          >
            { works.map((work) => (
              <Box key={ work.id } sx={ { display: 'flex', flexDirection: 'column' } }>
                <Box
                  component="img"
                  src={ work.image }
                  alt={ work.title }
                  loading="lazy"
                  sx={ {
                    width: '100%',
                    aspectRatio: '3 / 4',
                    objectFit: 'cover',
                    borderRadius: '2px',
                    mb: 0.75,
                  } }
                />
                <Typography
                  variant="caption"
                  sx={ {
                    color: 'text.secondary',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.65rem', md: '0.75rem' },
                  } }
                >
                  { work.title }
                </Typography>
                <Typography
                  variant="caption"
                  sx={ { color: 'text.disabled', fontSize: { xs: '0.6rem', md: '0.7rem' } } }
                >
                  { work.year }
                </Typography>
              </Box>
            )) }
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export { ColorDetailModal };
