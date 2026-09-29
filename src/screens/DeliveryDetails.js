import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Image,
  TouchableOpacity,
  PanResponder,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';

const { width, height } = Dimensions.get('window');

const DESIGN_WIDTH = 638;
const { rs, fs } = createScaler(DESIGN_WIDTH, 0.82);

const RED = '#CF0019';
const GREEN = '#04975F';
const DARK = '#111827';
const BLUE_GREY = '#5F728E';
const BORDER = '#DCE5EF';
const BG = '#F5F8FC';

// ============================================================
// SLIDER CONSTANTS
// ============================================================

const SLIDER_PADDING = rs(8);
const HANDLE_SIZE = rs(88);
const SLIDER_WIDTH = width - rs(54);

const MAX_SLIDE =
  SLIDER_WIDTH -
  HANDLE_SIZE -
  SLIDER_PADDING * 2;

const DeliveryDetailScreen = ({
  navigation,
}) => {
  const [delivered, setDelivered] =
    useState(false);

  // ============================================================
  // ENTRANCE ANIMATIONS
  // ============================================================

  const headerOpacity =
    useRef(new Animated.Value(0)).current;

  const headerY =
    useRef(new Animated.Value(-18)).current;

  const navigationOpacity =
    useRef(new Animated.Value(0)).current;

  const navigationY =
    useRef(new Animated.Value(-20)).current;

  const mapOpacity =
    useRef(new Animated.Value(0)).current;

  const mapScale =
    useRef(new Animated.Value(1.04)).current;

  const sheetOpacity =
    useRef(new Animated.Value(0)).current;

  const sheetY =
    useRef(new Animated.Value(70)).current;

  const detailsOpacity =
    useRef(new Animated.Value(0)).current;

  const detailsY =
    useRef(new Animated.Value(25)).current;

  const locationPulse =
    useRef(new Animated.Value(1)).current;

  const controlsX =
    useRef(new Animated.Value(50)).current;

  const controlsOpacity =
    useRef(new Animated.Value(0)).current;

  // ============================================================
  // SLIDER
  // ============================================================

  const sliderX =
    useRef(new Animated.Value(0)).current;

  const sliderTextOpacity =
    sliderX.interpolate({
      inputRange: [
        0,
        MAX_SLIDE * 0.65,
        MAX_SLIDE,
      ],

      outputRange: [
        1,
        0.35,
        0,
      ],

      extrapolate: 'clamp',
    });

  const sliderSuccessOpacity =
    sliderX.interpolate({
      inputRange: [
        0,
        MAX_SLIDE * 0.5,
        MAX_SLIDE,
      ],

      outputRange: [
        0,
        0.25,
        1,
      ],

      extrapolate: 'clamp',
    });

  // ============================================================
  // START ANIMATIONS
  // ============================================================

  useEffect(() => {
    Animated.sequence([
      // HEADER

      Animated.parallel([
        Animated.timing(
          headerOpacity,
          {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          headerY,
          {
            toValue: 0,
            duration: 420,
            easing:
              Easing.out(
                Easing.cubic,
              ),
            useNativeDriver: true,
          },
        ),
      ]),

      // NAVIGATION CARD

      Animated.parallel([
        Animated.timing(
          navigationOpacity,
          {
            toValue: 1,
            duration: 380,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          navigationY,
          {
            toValue: 0,
            duration: 430,
            easing:
              Easing.out(
                Easing.cubic,
              ),
            useNativeDriver: true,
          },
        ),
      ]),

      // MAP

      Animated.parallel([
        Animated.timing(
          mapOpacity,
          {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          },
        ),

        Animated.spring(
          mapScale,
          {
            toValue: 1,
            friction: 8,
            tension: 45,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          controlsOpacity,
          {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          controlsX,
          {
            toValue: 0,
            duration: 450,
            easing:
              Easing.out(
                Easing.cubic,
              ),
            useNativeDriver: true,
          },
        ),
      ]),

      // BOTTOM SHEET

      Animated.parallel([
        Animated.timing(
          sheetOpacity,
          {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          },
        ),

        Animated.spring(
          sheetY,
          {
            toValue: 0,
            friction: 8,
            tension: 55,
            useNativeDriver: true,
          },
        ),
      ]),

      // DETAILS

      Animated.parallel([
        Animated.timing(
          detailsOpacity,
          {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          detailsY,
          {
            toValue: 0,
            duration: 420,
            easing:
              Easing.out(
                Easing.cubic,
              ),
            useNativeDriver: true,
          },
        ),
      ]),
    ]).start();

    // GPS marker pulse

    const pulseLoop =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            locationPulse,
            {
              toValue: 1.22,
              duration: 900,
              easing:
                Easing.inOut(
                  Easing.ease,
                ),
              useNativeDriver: true,
            },
          ),

          Animated.timing(
            locationPulse,
            {
              toValue: 1,
              duration: 900,
              easing:
                Easing.inOut(
                  Easing.ease,
                ),
              useNativeDriver: true,
            },
          ),
        ]),
      );

    const timer =
      setTimeout(() => {
        pulseLoop.start();
      }, 1300);

    return () => {
      clearTimeout(timer);

      pulseLoop.stop();
    };
  }, []);

  // ============================================================
  // RESET SLIDER
  // ============================================================

  const resetSlider = () => {
    Animated.spring(
      sliderX,
      {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: false,
      },
    ).start();
  };

  // ============================================================
  // DELIVERY COMPLETED
  // ============================================================

  const completeDelivery = () => {
    Animated.spring(
      sliderX,
      {
        toValue: MAX_SLIDE,
        friction: 7,
        tension: 70,
        useNativeDriver: false,
      },
    ).start(() => {
      setDelivered(true);

      Alert.alert(
        'Delivery Completed',
        'Order marked as delivered successfully.',
        [
          {
            text: 'OK',

            onPress: () => {
              navigation.navigate(ROUTES.HOME);
            },
          },
        ],
      );
    });
  };

  // ============================================================
  // SLIDER PAN RESPONDER
  // ============================================================

  const panResponder =
    useRef(
      PanResponder.create({
        onStartShouldSetPanResponder:
          () => !delivered,

        onMoveShouldSetPanResponder:
          (_, gestureState) =>
            !delivered &&
            Math.abs(
              gestureState.dx,
            ) > 3,

        onPanResponderGrant: () => {
          sliderX.stopAnimation();
        },

        onPanResponderMove:
          (_, gestureState) => {
            if (delivered) {
              return;
            }

            const nextValue =
              Math.max(
                0,
                Math.min(
                  gestureState.dx,
                  MAX_SLIDE,
                ),
              );

            sliderX.setValue(
              nextValue,
            );
          },

        onPanResponderRelease:
          (_, gestureState) => {
            if (delivered) {
              return;
            }

            if (
              gestureState.dx >
              MAX_SLIDE * 0.72
            ) {
              completeDelivery();
            } else {
              resetSlider();
            }
          },

        onPanResponderTerminate:
          () => {
            if (!delivered) {
              resetSlider();
            }
          },
      }),
    ).current;

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.screen}>
        {/* ======================================================
            HEADER
        ====================================================== */}

        <Animated.View
          style={[
            styles.header,

            {
              opacity:
                headerOpacity,

              transform: [
                {
                  translateY:
                    headerY,
                },
              ],
            },
          ]}
        >
          <View
            style={
              styles.brandSection
            }
          >
            <Image
              source={require('../assets/logo.png')}
              style={
                styles.brandLogo
              }
              resizeMode="contain"
            />

            <View>
              <Text
                style={
                  styles.brandTitle
                }
              >
                Patel’s Driver
              </Text>

              <Text
                style={
                  styles.brandSubtitle
                }
              >
                Live Map
              </Text>
            </View>
          </View>

          <View
            style={
              styles.headerRight
            }
          >
            <View
              style={
                styles.dutyBadge
              }
            >
              <View
                style={
                  styles.dutyDot
                }
              />

              <Text
                style={
                  styles.dutyText
                }
              >
                ON DUTY
              </Text>
            </View>

            <Image
              source={require('../assets/logo.png')}
              style={
                styles.profileImage
              }
              resizeMode="cover"
            />
          </View>
        </Animated.View>

        {/* ======================================================
            MAIN AREA
        ====================================================== */}

        <View
          style={
            styles.contentContainer
          }
        >
          {/* ====================================================
              MAP
          ==================================================== */}

          <Animated.View
            style={[
              styles.mapContainer,

              {
                opacity:
                  mapOpacity,

                transform: [
                  {
                    scale:
                      mapScale,
                  },
                ],
              },
            ]}
          >
            <Image
              source={require('../assets/logo.png')}
              style={
                styles.mapImage
              }
              resizeMode="cover"
            />

            {/* ==================================================
                NAVIGATION CARD
            ================================================== */}

            <Animated.View
              style={[
                styles.navigationCard,

                {
                  opacity:
                    navigationOpacity,

                  transform: [
                    {
                      translateY:
                        navigationY,
                    },
                  ],
                },
              ]}
            >
              <View
                style={
                  styles.navigationTop
                }
              >
                <View
                  style={
                    styles.turnIconBox
                  }
                >
                  <Text
                    style={
                      styles.turnIcon
                    }
                  >
                    ┌→
                  </Text>
                </View>

                <View
                  style={
                    styles.navigationInfo
                  }
                >
                  <View
                    style={
                      styles.distanceTitleRow
                    }
                  >
                    <Text
                      style={
                        styles.distanceTitle
                      }
                    >
                      In 250m
                    </Text>

                    <Text
                      style={
                        styles.nextStep
                      }
                    >
                      NEXT STEP
                    </Text>
                  </View>

                  <Text
                    numberOfLines={1}
                    style={
                      styles.roadTitle
                    }
                  >
                    Turn Right onto MG R...
                  </Text>
                </View>

                <View
                  style={
                    styles.laneButton
                  }
                >
                  <View
                    style={
                      styles.laneArrows
                    }
                  >
                    <Text
                      style={
                        styles.straightArrow
                      }
                    >
                      ↑
                    </Text>

                    <Text
                      style={
                        styles.rightArrow
                      }
                    >
                      ↱
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.laneText
                    }
                  >
                    LANE 2
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={
                    styles.soundButton
                  }
                >
                  <Text
                    style={
                      styles.soundIcon
                    }
                  >
                    🔊
                  </Text>
                </TouchableOpacity>
              </View>

              {/* NAV STATS */}

              <View
                style={
                  styles.navigationBottom
                }
              >
                <View
                  style={
                    styles.navMetric
                  }
                >
                  <Text
                    style={
                      styles.timerIcon
                    }
                  >
                    ⏱
                  </Text>

                  <Text
                    style={
                      styles.navMetricPrimary
                    }
                  >
                    6 mins
                  </Text>

                  <Text
                    style={
                      styles.metricDot
                    }
                  >
                    •
                  </Text>

                  <Text
                    style={
                      styles.navMetricSecondary
                    }
                  >
                    1.4 km left
                  </Text>
                </View>

                <View
                  style={
                    styles.speedSection
                  }
                >
                  <View
                    style={
                      styles.speedDot
                    }
                  />

                  <Text
                    style={
                      styles.speedText
                    }
                  >
                    38 km/h
                  </Text>

                  <View
                    style={
                      styles.limitBadge
                    }
                  >
                    <Text
                      style={
                        styles.limitText
                      }
                    >
                      LIMIT 40
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* ==================================================
                GPS LOCATION
            ================================================== */}

            <Animated.View
              style={[
                styles.currentLocationPulse,

                {
                  transform: [
                    {
                      scale:
                        locationPulse,
                    },
                  ],
                },
              ]}
            />

            <View
              style={
                styles.currentLocation
              }
            >
              <View
                style={
                  styles.currentLocationInner
                }
              >
                <Text
                  style={
                    styles.currentArrow
                  }
                >
                  ▲
                </Text>
              </View>
            </View>

            {/* ==================================================
                MAP CONTROLS
            ================================================== */}

            <Animated.View
              style={[
                styles.mapControls,

                {
                  opacity:
                    controlsOpacity,

                  transform: [
                    {
                      translateX:
                        controlsX,
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.emergencyMapButton
                }
              >
                <Text
                  style={
                    styles.emergencyIcon
                  }
                >
                  🚨
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.trafficMapButton
                }
              >
                <Text
                  style={
                    styles.trafficIcon
                  }
                >
                  🚦
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.locateMapButton
                }
              >
                <Text
                  style={
                    styles.locateIcon
                  }
                >
                  ◎
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* ====================================================
              DELIVERY SHEET
          ==================================================== */}

          <Animated.ScrollView
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"

            style={[
              styles.deliverySheet,

              {
                opacity:
                  sheetOpacity,

                transform: [
                  {
                    translateY:
                      sheetY,
                  },
                ],
              },
            ]}

            contentContainerStyle={
              styles.sheetContent
            }
          >
            {/* DRAG BAR */}

            <View
              style={
                styles.dragHandle
              }
            />

            <Animated.View
              style={{
                opacity:
                  detailsOpacity,

                transform: [
                  {
                    translateY:
                      detailsY,
                  },
                ],
              }}
            >
              {/* =================================================
                  ORDER HEADING
              ================================================= */}

              <View
                style={
                  styles.orderHeadingRow
                }
              >
                <View
                  style={
                    styles.orderBadgeRow
                  }
                >
                  <View
                    style={
                      styles.restaurantBadge
                    }
                  >
                    <Text
                      style={
                        styles.restaurantBadgeText
                      }
                    >
                      PATEL HOTEL EXPRESS
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.orderNumber
                    }
                  >
                    #P-8924
                  </Text>
                </View>

                <View
                  style={
                    styles.scheduleBadge
                  }
                >
                  <View
                    style={
                      styles.scheduleDot
                    }
                  />

                  <Text
                    style={
                      styles.scheduleText
                    }
                  >
                    ON SCHEDULE
                  </Text>
                </View>
              </View>

              {/* =================================================
                  DESTINATION
              ================================================= */}

              <View
                style={
                  styles.destinationCard
                }
              >
                <View
                  style={
                    styles.destinationIconBox
                  }
                >
                  <Text
                    style={
                      styles.destinationIcon
                    }
                  >
                    ⌖
                  </Text>
                </View>

                <View
                  style={
                    styles.destinationInfo
                  }
                >
                  <Text
                    style={
                      styles.destinationLabel
                    }
                  >
                    DESTINATION FLAT
                  </Text>

                  <Text
                    style={
                      styles.destinationTitle
                    }
                  >
                    Flat 402, Lotus Residency
                  </Text>

                  <Text
                    style={
                      styles.destinationAddress
                    }
                  >
                    4th Cross, Near Diamond District
                  </Text>
                </View>
              </View>

              {/* =================================================
                  CUSTOMER
              ================================================= */}

              <View
                style={
                  styles.customerCard
                }
              >
                <View
                  style={
                    styles.customerAvatar
                  }
                >
                  <Text
                    style={
                      styles.customerAvatarText
                    }
                  >
                    VM
                  </Text>
                </View>

                <View
                  style={
                    styles.customerInfo
                  }
                >
                  <Text
                    style={
                      styles.customerName
                    }
                  >
                    Vikram Mehta
                  </Text>

                  <Text
                    style={
                      styles.customerOrderType
                    }
                  >
                    Prepaid Order •
                    {'\n'}
                    Cashless
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={
                    styles.contactButton
                  }
                >
                  <Text
                    style={
                      styles.callIcon
                    }
                  >
                    ☎
                  </Text>

                  <Text
                    style={
                      styles.contactButtonText
                    }
                  >
                    Call
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}

                  style={[
                    styles.contactButton,

                    {
                      marginLeft:
                        rs(12),
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.chatIcon
                    }
                  >
                    ▤
                  </Text>

                  <Text
                    style={
                      styles.contactButtonText
                    }
                  >
                    Chat
                  </Text>
                </TouchableOpacity>
              </View>

              {/* =================================================
                  NOTE
              ================================================= */}

              <View
                style={
                  styles.noteCard
                }
              >
                <View
                  style={
                    styles.hotFoodIconBox
                  }
                >
                  <Text
                    style={
                      styles.hotFoodIcon
                    }
                  >
                    ♨
                  </Text>
                </View>

                <View
                  style={
                    styles.noteContent
                  }
                >
                  <View
                    style={
                      styles.noteTags
                    }
                  >
                    <View
                      style={
                        styles.hotGravyBadge
                      }
                    >
                      <Text
                        style={
                          styles.hotGravyText
                        }
                      >
                        EXTRA HOT GRAVY
                      </Text>
                    </View>

                    <View
                      style={
                        styles.uprightBadge
                      }
                    >
                      <Text
                        style={
                          styles.uprightText
                        }
                      >
                        KEEP UPRIGHT
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={
                      styles.noteText
                    }
                  >
                    Please ring bell and leave with security if unreachable. Extra hot gravy alert.
                  </Text>
                </View>
              </View>

              {/* =================================================
                  SLIDE WHEN DELIVERED
              ================================================= */}

              <View
                style={
                  styles.sliderWrapper
                }
              >
                <Animated.View
                  pointerEvents="none"

                  style={[
                    styles.sliderSuccessBackground,

                    {
                      opacity:
                        sliderSuccessOpacity,
                    },
                  ]}
                />

                {!delivered && (
                  <Animated.Text
                    pointerEvents="none"

                    style={[
                      styles.sliderLabel,

                      {
                        opacity:
                          sliderTextOpacity,
                      },
                    ]}
                  >
                    »
                    {'  '}
                    SLIDE WHEN DELIVERED
                  </Animated.Text>
                )}

                {delivered && (
                  <Text
                    style={
                      styles.deliveredText
                    }
                  >
                    ✓ DELIVERED
                  </Text>
                )}

                <Animated.View
                  {...panResponder.panHandlers}

                  style={[
                    styles.sliderHandle,

                    {
                      transform: [
                        {
                          translateX:
                            sliderX,
                        },
                      ],
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.sliderArrow
                    }
                  >
                    ›
                  </Text>
                </Animated.View>
              </View>

              <View
                style={{
                  height: rs(25),
                }}
              />
            </Animated.View>
          </Animated.ScrollView>
        </View>

        {/* ======================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <View
          style={
            styles.bottomNavigation
          }
        >
          <BottomNavItem
            icon="▦"
            label="Home"
            onPress={() => navigation.navigate(ROUTES.HOME)}
          />

          <BottomNavItem
            icon="♢"
            label="Orders"
            onPress={() => navigation.navigate(ROUTES.ORDERS)}
          />

          <BottomNavItem
            icon="◉"
            label="Live Map"
            active
            onPress={() => navigation.navigate(ROUTES.LIVE_MAP)}
          />

          <BottomNavItem
            icon="▣"
            label="History"
            onPress={() => navigation.navigate(ROUTES.HISTORY)}
          />

          <BottomNavItem
            icon="♙"
            label="Profile"
            onPress={() => navigation.navigate(ROUTES.PROFILE)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// ============================================================
// BOTTOM NAV ITEM
// ============================================================

const BottomNavItem = ({
  icon,
  label,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}

      style={styles.navItem}

      onPress={onPress}
    >
      <Text
        style={[
          styles.navIcon,

          active &&
            styles.navIconActive,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.navLabel,

          active &&
            styles.navLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default DeliveryDetailScreen;

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  contentContainer: {
    flex: 1,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    height: rs(105),

    backgroundColor: '#FFFFFF',

    paddingHorizontal: rs(28),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#E7ECF2',

    zIndex: 20,
  },

  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandLogo: {
    width: rs(52),
    height: rs(52),

    marginRight: rs(15),
  },

  brandTitle: {
    color: DARK,

    fontSize: fs(29),
    fontWeight: '900',
  },

  brandSubtitle: {
    color: BLUE_GREY,

    fontSize: fs(17),
    fontWeight: '700',

    marginTop: rs(4),
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dutyBadge: {
    minHeight: rs(64),

    paddingHorizontal: rs(23),

    borderRadius: rs(34),

    backgroundColor: '#E8FFF5',

    borderWidth: 1.5,
    borderColor: '#9DE9C6',

    flexDirection: 'row',
    alignItems: 'center',

    marginRight: rs(17),
  },

  dutyDot: {
    width: rs(15),
    height: rs(15),

    borderRadius: rs(8),

    backgroundColor: '#0AB87A',

    marginRight: rs(12),
  },

  dutyText: {
    color: '#174F3D',

    fontSize: fs(19),
    fontWeight: '900',

    letterSpacing: 1,
  },

  profileImage: {
    width: rs(58),
    height: rs(58),

    borderRadius: rs(29),

    borderWidth: 2,
    borderColor: '#E6CBC1',
  },

  // ==========================================================
  // MAP
  // ==========================================================

  mapContainer: {
    height: height * 0.39,

    backgroundColor: '#DFE8EF',

    overflow: 'hidden',
  },

  mapImage: {
    width: '100%',
    height: '100%',
  },

  // ==========================================================
  // NAVIGATION CARD
  // ==========================================================

  navigationCard: {
    position: 'absolute',

    top: rs(22),
    left: rs(27),
    right: rs(27),

    backgroundColor: '#FFFFFF',

    borderRadius: rs(22),

    padding: rs(20),

    shadowColor: '#73869B',

    shadowOpacity: 0.19,
    shadowRadius: 15,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 10,
  },

  navigationTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  turnIconBox: {
    width: rs(80),
    height: rs(80),

    borderRadius: rs(14),

    backgroundColor: '#C90019',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(18),
  },

  turnIcon: {
    color: '#FFFFFF',

    fontSize: fs(40),
    fontWeight: '700',
  },

  navigationInfo: {
    flex: 1,
  },

  distanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  distanceTitle: {
    color: DARK,

    fontSize: fs(28),
    fontWeight: '900',
  },

  nextStep: {
    color: '#C85200',

    fontSize: fs(17),
    fontWeight: '900',

    marginLeft: rs(10),

    letterSpacing: 0.7,
  },

  roadTitle: {
    color: '#16223B',

    fontSize: fs(23),
    fontWeight: '500',

    marginTop: rs(5),
  },

  laneButton: {
    width: rs(82),
    height: rs(73),

    backgroundColor: '#F1F5FA',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(10),

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: rs(10),
  },

  laneArrows: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  straightArrow: {
    color: '#7D93AD',

    fontSize: fs(22),

    marginRight: rs(8),
  },

  rightArrow: {
    color: RED,

    fontSize: fs(20),
    fontWeight: '900',
  },

  laneText: {
    color: '#37465D',

    fontSize: fs(11),
    fontWeight: '900',

    marginTop: rs(6),
  },

  soundButton: {
    width: rs(70),
    height: rs(73),

    backgroundColor: '#F1F5FA',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(10),

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: rs(10),
  },

  soundIcon: {
    fontSize: fs(25),
  },

  navigationBottom: {
    marginTop: rs(16),

    minHeight: rs(60),

    backgroundColor: '#F8FAFC',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(12),

    paddingHorizontal: rs(18),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  navMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timerIcon: {
    color: RED,

    fontSize: fs(20),

    marginRight: rs(9),
  },

  navMetricPrimary: {
    color: DARK,

    fontSize: fs(20),
    fontWeight: '900',
  },

  metricDot: {
    color: '#CAD4DF',

    fontSize: fs(24),

    marginHorizontal: rs(9),
  },

  navMetricSecondary: {
    color: '#51627A',

    fontSize: fs(18),
    fontWeight: '600',
  },

  speedSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  speedDot: {
    width: rs(13),
    height: rs(13),

    borderRadius: rs(7),

    backgroundColor: '#12B77A',

    marginRight: rs(10),
  },

  speedText: {
    color: '#06754E',

    fontSize: fs(18),
    fontWeight: '800',

    marginRight: rs(12),
  },

  limitBadge: {
    paddingHorizontal: rs(9),
    paddingVertical: rs(8),

    borderWidth: 1,
    borderColor: '#C9D5E2',

    borderRadius: rs(6),

    backgroundColor: '#FFFFFF',
  },

  limitText: {
    color: '#3A4A60',

    fontSize: fs(14),
    fontWeight: '800',
  },

  // ==========================================================
  // CURRENT LOCATION
  // ==========================================================

  currentLocationPulse: {
    position: 'absolute',

    left: '47%',
    bottom: rs(110),

    width: rs(55),
    height: rs(55),

    marginLeft: -rs(28),

    borderRadius: rs(28),

    backgroundColor: 'rgba(0,160,100,0.20)',
  },

  currentLocation: {
    position: 'absolute',

    left: '47%',
    bottom: rs(119),

    width: rs(37),
    height: rs(37),

    marginLeft: -rs(19),

    borderRadius: rs(19),

    backgroundColor: '#FFFFFF',

    borderWidth: 3,
    borderColor: '#6ED6B3',

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 6,
  },

  currentLocationInner: {
    width: rs(25),
    height: rs(25),

    borderRadius: rs(13),

    backgroundColor: GREEN,

    alignItems: 'center',
    justifyContent: 'center',
  },

  currentArrow: {
    color: '#FFFFFF',

    fontSize: fs(13),
  },

  // ==========================================================
  // MAP CONTROLS
  // ==========================================================

  mapControls: {
    position: 'absolute',

    right: rs(26),
    bottom: rs(25),

    alignItems: 'center',
  },

  emergencyMapButton: {
    width: rs(72),
    height: rs(72),

    borderRadius: rs(36),

    backgroundColor: '#CB0019',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: rs(15),

    elevation: 8,
  },

  emergencyIcon: {
    fontSize: fs(28),
  },

  trafficMapButton: {
    width: rs(68),
    height: rs(68),

    borderRadius: rs(34),

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: rs(15),

    elevation: 6,
  },

  trafficIcon: {
    fontSize: fs(27),
  },

  locateMapButton: {
    width: rs(68),
    height: rs(68),

    borderRadius: rs(34),

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 6,
  },

  locateIcon: {
    color: '#26384F',

    fontSize: fs(35),
    fontWeight: '900',
  },

  // ==========================================================
  // DELIVERY SHEET
  // ==========================================================

  deliverySheet: {
    flex: 1,

    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: rs(28),
    borderTopRightRadius: rs(28),

    marginTop: -rs(1),

    zIndex: 10,
  },

  sheetContent: {
    paddingHorizontal: rs(27),
    paddingBottom: rs(30),
  },

  dragHandle: {
    width: rs(65),
    height: rs(7),

    borderRadius: rs(4),

    backgroundColor: '#CBD5E1',

    alignSelf: 'center',

    marginTop: rs(18),
    marginBottom: rs(18),
  },

  // ==========================================================
  // ORDER HEADER
  // ==========================================================

  orderHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  orderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  restaurantBadge: {
    backgroundColor: '#FFF9D8',

    borderWidth: 1,
    borderColor: '#EECF65',

    borderRadius: rs(7),

    paddingHorizontal: rs(13),
    paddingVertical: rs(7),
  },

  restaurantBadgeText: {
    color: '#8C3518',

    fontSize: fs(14),
    fontWeight: '900',

    letterSpacing: 0.4,
  },

  orderNumber: {
    color: BLUE_GREY,

    fontSize: fs(18),
    fontWeight: '700',

    marginLeft: rs(15),
  },

  scheduleBadge: {
    backgroundColor: '#E9FFF6',

    borderWidth: 1,
    borderColor: '#9CE7C5',

    borderRadius: rs(24),

    paddingHorizontal: rs(16),
    paddingVertical: rs(9),

    flexDirection: 'row',
    alignItems: 'center',
  },

  scheduleDot: {
    width: rs(12),
    height: rs(12),

    borderRadius: rs(6),

    backgroundColor: '#0AB97B',

    marginRight: rs(9),
  },

  scheduleText: {
    color: '#175A45',

    fontSize: fs(14),
    fontWeight: '900',
  },

  // ==========================================================
  // DESTINATION
  // ==========================================================

  destinationCard: {
    marginTop: rs(24),

    minHeight: rs(147),

    borderWidth: 1.5,
    borderColor: BORDER,

    backgroundColor: '#F8FAFD',

    borderRadius: rs(18),

    padding: rs(20),

    flexDirection: 'row',
    alignItems: 'center',
  },

  destinationIconBox: {
    width: rs(65),
    height: rs(65),

    borderRadius: rs(14),

    backgroundColor: '#FFF0F0',

    borderWidth: 1,
    borderColor: '#FFC8C8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(20),
  },

  destinationIcon: {
    color: RED,

    fontSize: fs(38),
  },

  destinationInfo: {
    flex: 1,
  },

  destinationLabel: {
    color: BLUE_GREY,

    fontSize: fs(15),
    fontWeight: '900',
  },

  destinationTitle: {
    color: DARK,

    fontSize: fs(28),
    fontWeight: '900',

    marginTop: rs(8),
  },

  destinationAddress: {
    color: '#40516C',

    fontSize: fs(20),

    marginTop: rs(7),
  },

  // ==========================================================
  // CUSTOMER
  // ==========================================================

  customerCard: {
    marginTop: rs(22),

    minHeight: rs(122),

    borderWidth: 1.5,
    borderColor: BORDER,

    backgroundColor: '#F8FAFD',

    borderRadius: rs(18),

    padding: rs(20),

    flexDirection: 'row',
    alignItems: 'center',
  },

  customerAvatar: {
    width: rs(64),
    height: rs(64),

    borderRadius: rs(32),

    borderWidth: 1,
    borderColor: '#FFB9B9',

    backgroundColor: '#FFF0F0',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(18),
  },

  customerAvatarText: {
    color: '#B60015',

    fontSize: fs(27),
    fontWeight: '900',
  },

  customerInfo: {
    flex: 1,
  },

  customerName: {
    color: DARK,

    fontSize: fs(22),
    fontWeight: '900',
  },

  customerOrderType: {
    color: GREEN,

    fontSize: fs(16),
    fontWeight: '700',

    lineHeight: fs(22),

    marginTop: rs(5),
  },

  contactButton: {
    minWidth: rs(123),
    height: rs(70),

    borderWidth: 1.5,
    borderColor: BORDER,

    borderRadius: rs(12),

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    elevation: 2,
  },

  callIcon: {
    color: GREEN,

    fontSize: fs(20),

    marginRight: rs(10),
  },

  chatIcon: {
    color: RED,

    fontSize: fs(19),

    marginRight: rs(10),
  },

  contactButtonText: {
    color: DARK,

    fontSize: fs(19),
    fontWeight: '800',
  },

  // ==========================================================
  // DELIVERY NOTE
  // ==========================================================

  noteCard: {
    marginTop: rs(22),

    minHeight: rs(145),

    borderWidth: 1.5,
    borderColor: '#F2CF62',

    borderRadius: rs(18),

    backgroundColor: '#FFFDF4',

    padding: rs(20),

    flexDirection: 'row',
  },

  hotFoodIconBox: {
    width: rs(53),
    height: rs(53),

    borderRadius: rs(12),

    backgroundColor: '#FFF6D8',

    borderWidth: 1,
    borderColor: '#F2D05D',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(20),
  },

  hotFoodIcon: {
    color: '#B45500',

    fontSize: fs(27),
  },

  noteContent: {
    flex: 1,
  },

  noteTags: {
    flexDirection: 'row',
    alignItems: 'center',

    flexWrap: 'wrap',
  },

  hotGravyBadge: {
    backgroundColor: '#C90019',

    paddingHorizontal: rs(16),
    paddingVertical: rs(11),

    borderRadius: rs(5),
  },

  hotGravyText: {
    color: '#FFFFFF',

    fontSize: fs(14),
    fontWeight: '900',

    letterSpacing: 0.7,
  },

  uprightBadge: {
    backgroundColor: '#E7EDF3',

    paddingHorizontal: rs(15),
    paddingVertical: rs(11),

    marginLeft: rs(10),

    borderRadius: rs(4),
  },

  uprightText: {
    color: '#25364E',

    fontSize: fs(13),
    fontWeight: '900',
  },

  noteText: {
    color: '#243149',

    fontSize: fs(18),
    lineHeight: fs(27),

    marginTop: rs(12),
  },

  // ==========================================================
  // SLIDER
  // ==========================================================

  sliderWrapper: {
    width: '100%',

    height: rs(105),

    marginTop: rs(27),

    backgroundColor: '#EFF4FA',

    borderWidth: 1.5,
    borderColor: '#C7D4E2',

    borderRadius: rs(55),

    justifyContent: 'center',

    overflow: 'hidden',

    paddingHorizontal:
      SLIDER_PADDING,
  },

  sliderSuccessBackground: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: '#E9FFF4',
  },

  sliderHandle: {
    position: 'absolute',

    left:
      SLIDER_PADDING,

    width:
      HANDLE_SIZE,

    height:
      HANDLE_SIZE,

    borderRadius:
      HANDLE_SIZE / 2,

    backgroundColor: '#C90019',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: RED,

    shadowOpacity: 0.24,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 8,
  },

  sliderArrow: {
    color: '#FFFFFF',

    fontSize: fs(56),

    fontWeight: '300',

    marginTop: -rs(5),
  },

  sliderLabel: {
    marginLeft: rs(112),

    color: '#243650',

    fontSize: fs(22),
    fontWeight: '900',

    letterSpacing: 1.3,
  },

  deliveredText: {
    alignSelf: 'center',

    color: GREEN,

    fontSize: fs(21),
    fontWeight: '900',

    letterSpacing: 1.2,
  },

  // ==========================================================
  // BOTTOM NAVIGATION
  // ==========================================================

  bottomNavigation: {
    minHeight:
      Platform.OS === 'ios'
        ? rs(90)
        : rs(82),

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E3E8EF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    paddingBottom:
      Platform.OS === 'ios'
        ? rs(8)
        : 0,

    elevation: 15,
  },

  navItem: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    color: '#60738F',

    fontSize: fs(26),
  },

  navIconActive: {
    color: RED,
  },

  navLabel: {
    color: '#60738F',

    fontSize: fs(13),
    fontWeight: '600',

    marginTop: rs(5),
  },

  navLabelActive: {
    color: RED,

    fontWeight: '800',
  },
});