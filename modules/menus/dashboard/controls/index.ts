const network = await Service.import("network");
const bluetooth = await Service.import("bluetooth");
const notifications = await Service.import("notifications");
const audio = await Service.import("audio");
const idle_inhibitor = Variable(false);

const IdleInhibitorLabel = Widget.Label({
  setup: (self) => {
    self.hook(idle_inhibitor, () => {
      return (self.label = idle_inhibitor.value ? "💤" : "🍵");
    });
  },
}).poll(1000, self => {
    const current_inhibitor_state = Utils.exec('bash -c "matcha --status"');
    if(current_inhibitor_state === "Off") {
      idle_inhibitor.setValue(false);
      self.label = "🍵"
    }
    else
    {
      idle_inhibitor.setValue(true);
      self.label = "💤"
    }
})

const Controls = () => {
  return Widget.Box({
    class_name: "dashboard-card controls-container",
    hpack: "fill",
    vpack: "fill",
    expand: true,
    children: [
      Widget.Button({
        tooltip_text: "Toggle Wifi",
        expand: true,
        setup: (self) => {
          self.hook(network, () => {
            return (self.class_name = `dashboard-button wifi ${!network.wifi.enabled ? "disabled" : ""}`);
          });
        },
        on_primary_click: () => network.toggleWifi(),
        child: Widget.Label({
          setup: (self) => {
            self.hook(network, () => {
              return (self.label = network.wifi.enabled ? "󰤨" : "󰤭");
            });
          },
        }),
      }),
      Widget.Button({
        tooltip_text: "Toggle Bluetooth",
        expand: true,
        class_name: bluetooth
          .bind("enabled")
          .as(
            (btOn) => `dashboard-button bluetooth ${!btOn ? "disabled" : ""}`,
          ),
        on_primary_click: () => bluetooth.toggle(),
        child: Widget.Label({
          label: bluetooth.bind("enabled").as((btOn) => (btOn ? "󰂯" : "󰂲")),
        }),
      }),
      Widget.Button({
        tooltip_text: "Toggle Notifications",
        expand: true,
        class_name: notifications
          .bind("dnd")
          .as(
            (dnd) => `dashboard-button notifications ${dnd ? "disabled" : ""}`,
          ),
        on_primary_click: () => (notifications.dnd = !notifications.dnd),
        child: Widget.Label({
          label: notifications.bind("dnd").as((dnd) => (dnd ? "󰂛" : "󰂚")),
        }),
      }),
      Widget.Button({
        tooltip_text: "Toggle Mute (Playback)",
        expand: true,
        on_primary_click: () =>
          (audio.speaker.is_muted = !audio.speaker.is_muted),
        setup: (self) => {
          self.hook(audio, () => {
            return (self.class_name = `dashboard-button playback ${audio.speaker.is_muted ? "disabled" : ""}`);
          });
        },
        child: Widget.Label({
          setup: (self) => {
            self.hook(audio, () => {
              return (self.label = audio.speaker.is_muted ? "󰖁" : "󰕾");
            });
          },
        }),
      }),
      Widget.Button({
        tooltip_text: "Toggle Mute (Microphone)",
        expand: true,
        on_primary_click: () =>
          (audio.microphone.is_muted = !audio.microphone.is_muted),
        setup: (self) => {
          self.hook(audio, () => {
            return (self.class_name = `dashboard-button input ${audio.microphone.is_muted ? "disabled" : ""}`);
          });
        },
        child: Widget.Label({
          setup: (self) => {
            self.hook(audio, () => {
              return (self.label = audio.microphone.is_muted ? "󰍭" : "󰍬");
            });
          },
        }),
      }),
      Widget.Button({
        tooltip_text: "Toggle Idle Inhibitor",
        expand: true,
        onClicked: () => {
            idle_inhibitor.setValue(!idle_inhibitor.value);
            Utils.execAsync(["matcha", "-t"]);
        },
        setup: (self) => {
          // Start the matcha daemon with the inhibitor off
          idle_inhibitor.setValue(false);
          Utils.execAsync(["bash", "-c", "pidof matcha || matcha -d -o"]);
          const current_inhibitor_state = Utils.exec('bash -c "matcha --status"');
          if(current_inhibitor_state !== "Off") {
            Utils.execAsync(["matcha", "-t"]);
          }
          self.hook(idle_inhibitor, () => {
            return (self.class_name = `dashboard-button idle_inhibitor ${idle_inhibitor ? "disabled" : ""}`);
          });
        },
        child: IdleInhibitorLabel,
      }),
    ],
  });
};

export { Controls };
