import React, { useEffect, useState } from "react";
import { 
    TouchableOpacity, StyleSheet, View, Dimensions, 
    Modal, TouchableWithoutFeedback, Text 
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MenuControl({ visible, onClose, items, from, isModal = false, horizontal = false, menuWidth: customWidth, backgroundColor = "white" }) {
    const [popoverLayout, setPopoverLayout] = useState(null);
    const menuWidth = customWidth || (horizontal ? 280 : 200);

    useEffect(() => {
        if (!visible) {
            setPopoverLayout(null);
            return;
        }

        if (visible && from?.current) {
            const timer = setTimeout(() => {
                if (from.current) {
                    from.current.measureInWindow((pageX, pageY, width, height) => {
                        if (pageY === 0 && pageX === 0) return;

                        const targetCenterX = pageX + width / 2;
                        let menuLeft = targetCenterX - menuWidth / 2;

                        if (menuLeft < 8) menuLeft = 8;
                        else if (menuLeft + menuWidth > SCREEN_WIDTH - 8) menuLeft = SCREEN_WIDTH - menuWidth - 8;

                        let arrowLeft = targetCenterX - menuLeft - 8;

                        const estimatedMenuHeight = horizontal ? 60 : items.length * 48 + 16;
                        const spaceBelow = SCREEN_HEIGHT - (pageY + height);
                        
                        // Nếu là modal, tọa độ pageY có thể khác hoặc cần offset khác
                        const offset = isModal ? 10 : 50; 
                        
                        const shouldShowAbove = pageY > SCREEN_HEIGHT / 2 && spaceBelow < estimatedMenuHeight;

                        setPopoverLayout({
                            top: shouldShowAbove ? undefined : pageY + height + (horizontal ? 5 : offset),
                            bottom: shouldShowAbove ? SCREEN_HEIGHT - pageY + offset : undefined,
                            left: menuLeft,
                            arrowLeft: arrowLeft,
                            showAbove: shouldShowAbove,
                        });
                    });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [visible, from, menuWidth, items.length, horizontal, isModal]);

    if (!visible || !popoverLayout) return null;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop}>
                    <TouchableWithoutFeedback>
                        <View
                            style={[
                                styles.popoverContainer,
                                { left: popoverLayout.left, width: menuWidth },
                                popoverLayout.showAbove
                                    ? { bottom: popoverLayout.bottom }
                                    : { top: popoverLayout.top }
                            ]}
                        >
                            <Animated.View
                                entering={ZoomIn.duration(150)}
                                exiting={ZoomOut.duration(100)}
                                style={styles.menuWrapper}
                            >
                                <View style={popoverLayout.showAbove ? styles.arrowContainerBottom : styles.arrowContainerTop}>
                                    <View style={[
                                        popoverLayout.showAbove ? styles.arrowDown : styles.arrowUp,
                                        { left: popoverLayout.arrowLeft, borderBottomColor: backgroundColor, borderTopColor: backgroundColor }
                                    ]} />
                                </View>

                                <View style={[styles.menuContent, { backgroundColor, flexDirection: horizontal ? 'row' : 'column', padding: horizontal ? 4 : 0 }]}>
                                    {items.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                item.onPress();
                                                if (!item.keepOpen) onClose();
                                            }}
                                            activeOpacity={0.7}
                                            style={[
                                                horizontal ? styles.horizontalItem : styles.item,
                                                (!horizontal && index < items.length - 1) && styles.borderBottom
                                            ]}
                                        >
                                            {horizontal ? (
                                                <Text style={styles.emojiText}>{item.emoji || item.label}</Text>
                                            ) : (
                                                <View style={styles.itemRow}>
                                                    {item.icon && (
                                                        <View style={styles.iconBox}>
                                                            {item.iconSet === 'MaterialCommunityIcons' ? (
                                                                <MaterialCommunityIcons name={item.icon} size={20} color={item.color || "#444"} />
                                                            ) : (
                                                                <Feather name={item.icon} size={18} color={item.color || "#444"} />
                                                            )}
                                                        </View>
                                                    )}
                                                    <Text style={[styles.itemText, { color: item.color || "#444" }]}>
                                                        {item.label}
                                                    </Text>
                                                    {item.active && (
                                                        <Ionicons name="checkmark" size={18} color="#0084ff" style={styles.checkIcon} />
                                                    )}
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </Animated.View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'transparent', // Make it transparent as per common popovers or light dim
    },
    popoverContainer: {
        position: 'absolute',
        zIndex: 9999,
        elevation: 10,
    },
    menuWrapper: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },
    menuContent: {
        backgroundColor: "white",
        borderRadius: 12,
        overflow: "hidden",
    },
    item: {
        width: "100%",
    },
    borderBottom: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
    },
    itemRow: {
        flexDirection: "row", 
        alignItems: "center", 
        paddingVertical: 14, 
        paddingHorizontal: 16
    },
    horizontalItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    emojiText: {
        fontSize: 26,
    },
    iconBox: {
        marginRight: 12,
        width: 24,
        alignItems: 'center'
    },
    itemText: {
        fontSize: 15,
        fontWeight: "500",
        flex: 1
    },
    checkIcon: {
        marginLeft: 8
    },
    arrowContainerTop: {
        position: 'absolute',
        top: -8,
        width: '100%',
        height: 8,
    },
    arrowContainerBottom: {
        position: 'absolute',
        bottom: -8,
        width: '100%',
        height: 8,
    },
    arrowUp: {
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "white",
        position: "absolute",
        top: 0,
    },
    arrowDown: {
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "white",
        position: "absolute",
        bottom: 0,
    },
});
