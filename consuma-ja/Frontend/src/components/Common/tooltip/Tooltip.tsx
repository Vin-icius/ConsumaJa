import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, Dimensions } from 'react-native';
import { tooltipStyles } from './tooltip.styled';

interface TooltipProps {
  text: string;
  maxLength?: number;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, maxLength = 50, children }) => {
  const [visible, setVisible] = useState(false);

  const displayText = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  const shouldShowTooltip = text.length > maxLength;

  const handlePress = () => {
    if (shouldShowTooltip) {
      setVisible(true);
    }
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <>
      {Platform.OS === 'web' ? (
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            width: '100%',
          }}
          onMouseEnter={() => shouldShowTooltip && setVisible(true)}
          onMouseLeave={() => setVisible(false)}
        >
          {children}
          {visible && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#333',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 4,
                fontSize: 14,
                whiteSpace: 'nowrap',
                zIndex: 1000,
                marginBottom: 5,
                maxWidth: 300,
                wordWrap: 'break-word',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {text}
            </div>
          )}
        </div>
      ) : (
        <TouchableOpacity onPress={handlePress} activeOpacity={shouldShowTooltip ? 0.7 : 1}>
          {children}
        </TouchableOpacity>
      )}

      {/* Modal para mobile */}
      <Modal
        visible={visible && Platform.OS !== 'web'}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={tooltipStyles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={tooltipStyles.modalContent}>
            <Text style={tooltipStyles.tooltipText}>{text}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default Tooltip;
