import Gdk from 'gi://Gdk?version=3.0';
const network = await Service.import("network");
import options from "options";
import { openMenu } from "../utils.js";

const Network = () => {
    const wifiIndicator = [
        Widget.Icon({
            class_name: "bar-button-icon network",
            icon: network.wifi.bind("icon_name"),
        }),
        Widget.Box({
            children: Utils.merge(
                [network.bind("wifi"), options.bar.network.label.bind("value")],
                (wifi, showLabel) => {
                    if (!showLabel) {
                        return [];
                    }
                    return [
                        Widget.Label({
                            class_name: "bar-button-label network",
                            label: wifi.ssid ? `${wifi.ssid.substring(0, 7)}` : "--",
                        }),
                    ]
                },
            )
        })
    ];

    const wiredIndicator = [
        Widget.Icon({
            class_name: "bar-button-icon network",
            icon: network.wired.bind("icon_name"),
        }),
        Widget.Box({
            children: Utils.merge(
                [network.bind("wired"), options.bar.network.label.bind("value")],
                (_, showLabel) => {
                    if (!showLabel) {
                        return [];
                    }
                    return [
                        Widget.Label({
                            class_name: "bar-button-label network",
                            label: "Wired",
                        }),
                    ]
                },
            )
        })
    ];

    return {
        component: Widget.Box({
            vpack: "center",
            class_name: "bar-network",
            children: network
                .bind("primary")
                .as((w) => (w === "wired" ? wiredIndicator : wifiIndicator)),
        }),
        isVisible: true,
        boxClass: "network",
        props: {
            on_primary_click: (clicked: any, event: Gdk.Event) => {
                openMenu(clicked, event, "networkmenu");
            },
        },
    };
};

export { Network };
