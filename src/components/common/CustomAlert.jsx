import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Global event registry for imperative calls
let alertListener = null;

const triggerHaptic = (type = 'medium') => {
  try {
    if (type === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === 'heavy') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (e) {
    // Graceful fallback on unsupported platforms/emulators
  }
};

/**
 * Infer the visual alert type (success, error, warning, confirm, info) from title/message
 */
function inferAlertType(title = '', message = '', buttons = []) {
  const text = `${title} ${message}`.toLowerCase();
  if (
    text.includes('error') ||
    text.includes('failed') ||
    text.includes('invalid') ||
    text.includes('missing') ||
    text.includes('problem') ||
    text.includes('unable') ||
    text.includes('wrong')
  ) {
    return 'error';
  }
  if (
    text.includes('success') ||
    text.includes('completed') ||
    text.includes('saved') ||
    text.includes('updated') ||
    text.includes('placed') ||
    text.includes('added to cart')
  ) {
    return 'success';
  }
  if (
    buttons.some(b => b?.style === 'destructive') ||
    text.includes('remove') ||
    text.includes('delete') ||
    text.includes('clear') ||
    text.includes('sign out') ||
    text.includes('log out') ||
    text.includes('cancel order') ||
    text.includes('are you sure')
  ) {
    return 'warning';
  }
  if (buttons.length > 1) {
    return 'confirm';
  }
  return 'info';
}

/**
 * Global CustomAlert object with drop-in Alert.alert signature
 */
export const CustomAlert = {
  alert: (title, message, buttons, options = {}) => {
    const inferredType = options?.type || inferAlertType(title, message, buttons);
    const config = {
      title: title || '',
      message: message || '',
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
      type: inferredType,
      cancelable: options?.cancelable ?? true,
      icon: options?.icon,
    };
    if (alertListener) {
      alertListener(config);
    }
  },
  show: (config) => {
    if (alertListener) {
      alertListener(config);
    }
  },
  success: (title, message, onOk) => {
    CustomAlert.alert(title, message, [{ text: 'OK', onPress: onOk }], { type: 'success' });
  },
  error: (title, message, onOk) => {
    CustomAlert.alert(title, message, [{ text: 'OK', onPress: onOk }], { type: 'error' });
  },
  warning: (title, message, onOk) => {
    CustomAlert.alert(title, message, [{ text: 'OK', onPress: onOk }], { type: 'warning' });
  },
  confirm: (title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel') => {
    CustomAlert.alert(
      title,
      message,
      [
        { text: cancelText, style: 'cancel', onPress: onCancel },
        { text: confirmText, onPress: onConfirm },
      ],
      { type: 'confirm' }
    );
  },
  hide: () => {
    if (alertListener) {
      alertListener(null);
    }
  },
};

export const showAlert = CustomAlert.alert;

/**
 * Root-level Modal Component to mount in App.jsx
 */
export function CustomAlertModal() {
  const [config, setConfig] = useState(null);
  const [visible, setVisible] = useState(false);

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.85)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;

  const closeAlert = useCallback((callback) => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(cardScaleAnim, {
        toValue: 0.88,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 15,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setConfig(null);
      if (typeof callback === 'function') {
        callback();
      }
    });
  }, [backdropAnim, cardScaleAnim, cardTranslateY]);

  useEffect(() => {
    alertListener = (newConfig) => {
      if (!newConfig) {
        closeAlert();
        return;
      }
      setConfig(newConfig);
      setVisible(true);

      // Trigger haptic based on alert type
      const alertType = newConfig.type || 'info';
      if (alertType === 'error') {
        triggerHaptic('error');
      } else if (alertType === 'success') {
        triggerHaptic('success');
      } else {
        triggerHaptic('medium');
      }

      // Reset values
      backdropAnim.setValue(0);
      cardScaleAnim.setValue(0.85);
      cardTranslateY.setValue(20);

      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(cardScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return () => {
      alertListener = null;
    };
  }, [closeAlert, backdropAnim, cardScaleAnim, cardTranslateY]);

  if (!visible || !config) {
    return null;
  }

  const { title, message, buttons = [], type = 'info', cancelable = true, icon } = config;

  const getTypeTheme = () => {
    switch (type) {
      case 'error':
        return {
          gradient: ['#EF4444', '#DC2626'],
          iconName: icon || 'alert-circle',
          iconColor: '#FFFFFF',
          badgeBg: 'rgba(239, 68, 68, 0.12)',
          buttonGradient: ['#DC2626', '#B91C1C'],
        };
      case 'success':
        return {
          gradient: ['#10B981', '#059669'],
          iconName: icon || 'checkmark-circle',
          iconColor: '#FFFFFF',
          badgeBg: 'rgba(16, 185, 129, 0.12)',
          buttonGradient: ['#123524', '#1F5135'],
        };
      case 'warning':
        return {
          gradient: ['#F59E0B', '#D97706'],
          iconName: icon || 'warning',
          iconColor: '#FFFFFF',
          badgeBg: 'rgba(245, 158, 11, 0.12)',
          buttonGradient: ['#DC2626', '#B91C1C'],
        };
      case 'confirm':
        return {
          gradient: ['#2E7D32', '#1B5E20'],
          iconName: icon || 'help-circle',
          iconColor: '#FFFFFF',
          badgeBg: 'rgba(46, 125, 50, 0.12)',
          buttonGradient: ['#123524', '#1F5135'],
        };
      case 'info':
      default:
        return {
          gradient: ['#15803D', '#166534'],
          iconName: icon || 'leaf',
          iconColor: '#FFFFFF',
          badgeBg: 'rgba(21, 128, 61, 0.12)',
          buttonGradient: ['#123524', '#1F5135'],
        };
    }
  };

  const theme = getTypeTheme();
  const isTwoButtons = buttons.length === 2;

  const handleButtonPress = (button) => {
    triggerHaptic('light');
    closeAlert(button.onPress);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (cancelable) closeAlert();
      }}
    >
      <TouchableWithoutFeedback onPress={() => cancelable && closeAlert()}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [
                    { scale: cardScaleAnim },
                    { translateY: cardTranslateY },
                  ],
                },
              ]}
            >
              {/* Top Accent Icon */}
              <View style={[styles.iconOuterRing, { backgroundColor: theme.badgeBg }]}>
                <LinearGradient
                  colors={theme.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <Ionicons name={theme.iconName} size={28} color={theme.iconColor} />
                </LinearGradient>
              </View>

              {/* Title */}
              {Boolean(title) && (
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
              )}

              {/* Message */}
              {Boolean(message) && (
                <Text style={styles.message}>
                  {message}
                </Text>
              )}

              {/* Buttons Container */}
              <View
                style={[
                  styles.buttonContainer,
                  isTwoButtons ? styles.twoButtonRow : styles.columnButtons,
                ]}
              >
                {buttons.map((button, index) => {
                  const isCancel = button.style === 'cancel';
                  const isDestructive = button.style === 'destructive';

                  if (isCancel) {
                    return (
                      <TouchableOpacity
                        key={`btn-${index}`}
                        style={[
                          styles.cancelButton,
                          isTwoButtons && { flex: 1 },
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleButtonPress(button)}
                      >
                        <Text style={styles.cancelButtonText}>
                          {button.text || 'Cancel'}
                        </Text>
                      </TouchableOpacity>
                    );
                  }

                  const btnGradient = isDestructive
                    ? ['#DC2626', '#B91C1C']
                    : theme.buttonGradient;

                  return (
                    <TouchableOpacity
                      key={`btn-${index}`}
                      style={[
                        styles.actionButtonWrapper,
                        isTwoButtons && { flex: 1.2 },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleButtonPress(button)}
                    >
                      <LinearGradient
                        colors={btnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.actionButton}
                      >
                        <Text style={styles.actionButtonText}>
                          {button.text || 'OK'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 30, 18, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: Math.min(width - 48, 350),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.12)',
  },
  iconOuterRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#123524',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  buttonContainer: {
    width: '100%',
  },
  twoButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  columnButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  cancelButton: {
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    color: '#4B5563',
  },
  actionButtonWrapper: {
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#123524',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14.5,
    fontFamily: 'DMSans_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
