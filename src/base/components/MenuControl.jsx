import React, { useEffect, useState } from "react";
import { 
    TouchableOpacity, View, Dimensions, 
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
                <View className="flex-1 bg-transparent">
                    <TouchableWithoutFeedback>
                        <View
                            className="absolute z-50 shadow-xl"
                            style={{
                                left: popoverLayout.left,
                                width: menuWidth,
                                ...(popoverLayout.showAbove ? { bottom: popoverLayout.bottom } : { top: popoverLayout.top }),
                                elevation: 10
                            }}
                        >
                            <Animated.View
                                entering={ZoomIn.duration(150)}
                                exiting={ZoomOut.duration(100)}
                                className="shadow-lg"
                            >
                                <View className={`absolute w-full h-2 ${popoverLayout.showAbove ? '-bottom-2' : '-top-2'}`}>
                                    <View 
                                        style={{
                                            width: 0,
                                            height: 0,
                                            backgroundColor: "transparent",
                                            borderStyle: "solid",
                                            borderLeftWidth: 8,
                                            borderRightWidth: 8,
                                            borderLeftColor: "transparent",
                                            borderRightColor: "transparent",
                                            ...(popoverLayout.showAbove 
                                                ? { borderTopWidth: 8, borderTopColor: backgroundColor, bottom: 0 } 
                                                : { borderBottomWidth: 8, borderBottomColor: backgroundColor, top: 0 }),
                                            position: "absolute",
                                            left: popoverLayout.arrowLeft
                                        }} 
                                    />
                                </View>

                                <View 
                                    className={`rounded-xl overflow-hidden ${horizontal ? 'flex-row p-1' : 'flex-col p-0'}`}
                                    style={{ backgroundColor }}
                                >
                                    {items.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                item.onPress();
                                                if (!item.keepOpen) onClose();
                                            }}
                                            activeOpacity={0.7}
                                            className={`${horizontal ? 'flex-1 items-center justify-center py-2.5' : 'w-full'} ${
                                                (!horizontal && index < items.length - 1) ? 'border-b border-gray-100 dark:border-zalo-darkBorder' : ''
                                            }`}
                                        >
                                            {horizontal ? (
                                                <Text className="text-[26px]">{item.emoji || item.label}</Text>
                                            ) : (
                                                <View className="flex-row items-center py-3.5 px-4">
                                                    {item.icon && (
                                                        <View className="mr-3 w-6 items-center">
                                                            {item.iconSet === 'MaterialCommunityIcons' ? (
                                                                <MaterialCommunityIcons name={item.icon} size={20} color={item.color || "#444"} />
                                                            ) : (
                                                                <Feather name={item.icon} size={18} color={item.color || "#444"} />
                                                            )}
                                                        </View>
                                                    )}
                                                    <Text className="text-[15px] font-medium flex-1" style={{ color: item.color || "#444" }}>
                                                        {item.label}
                                                    </Text>
                                                    {item.active && (
                                                        <Ionicons name="checkmark" size={18} color="#0084ff" className="ml-2" />
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
